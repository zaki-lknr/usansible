const main = async () => {
    const [ver,collection] = await getBranchName();
    // console.log("branch name: " + ver);
    // console.log("collection: " + collection);
    const baseurl = collection? getCollectionUrl(ver): getGitHubUrl(ver);

    if (baseurl) {
        // [View Source]を差し込むGitHubのリンクテキスト位置を取り出し
        const li = document.getElementsByClassName("wy-breadcrumbs-aside")[0]
        // console.log("innerhtml: " + li.innerHTML);

        if (li.innerHTML.match(/<\/a>\s*$/)) {
            // <a>の閉じタグで終わる -> Edit on GitHubがある旧スタイル
            // リンクテキストを差し込み
            li.innerHTML += ' / <a href="' + baseurl + '">View Source</a>'
        }
        else {
            // <a>で終わっていない -> Edit on GitHubがない(現状コメントアウトされて<br>になっている)
            // 単体のリンクテキスト差し込み
            li.innerHTML += '<a class="fa fa-github" href="' + baseurl + '"> View Source</a>'
        }

    }
}

/**
 * バージョン変換テーブル
 *
 * @param {*} version
 * @returns 変換後バージョン
 */
const ansible_version_table = (version) => {
    switch (version) {
    case "3":
        return "2.10";
    case "4":
        return "2.11";
    case "5":
        return "2.12";
    case "6":
        return "2.13";
    case "7":
        return "2.14";
    case "8":
        return "2.15";
    case "9":
        return "2.16";
    case "10":
        return "2.17";
    case "11":
        return "2.18";
    case "12":
        return "2.19";
    case "13":
        return "2.20";
    case "14":
        return "2.21";
    default:
        return version;
    }
}

/**
 * target versionをURLから取り出し、GitHubのbranch名に変換
 */
const getBranchName = async () => {
    // target versionをURLから取出し
    const v = document.URL.match(/docs\.ansible\.com\/projects\/ansible\/(.*?)\/(modules|plugins|collections)/);
    // console.log(v[1]);
    const collection = (v[2] == "collections")? true: false;
    const ver = await (async () => {
        switch (v[1]) {
        case "devel":
            return "devel";
        case "latest":
            // console.log("url: latest");
            const flyout = await waitForFlyout();
            const shadow = flyout.shadowRoot;
            const versions = [...shadow.querySelectorAll("dl.versions a")].map(a => (a.textContent.trim()));
            // 画面右下部分バージョン選択画面内の1個前のバージョン番号値を現バージョンとする
            /// ※「latest」「番号」「devel」の前提
            const version = versions.find((elem) => Number(elem));
            // console.log(version);
            return "stable-" + ansible_version_table(String(version));
            // console.log(ver);
        default:
            return "stable-" + ansible_version_table(v[1]);
        }
    })();
    // console.log("branch name: " + ver);

    return [ver, collection];
}

/**
 * GitHubのソースのURLを取得する(旧ページ構成)
 */
const getGitHubUrl = (branch) => {
    // ページ上部の[Edit on GitHub]の位置からソースのURL取得、モジュールは良いがプラグインが同じやり方だとリンク取得できない。
    // よってページ下部の[!]Hintの項目内にある"edit this document"のリンクから取得する。
    const external_links = document.getElementsByClassName("external");
    if (external_links) {
        // console.log(external_links);
        // HTMLCollectionで配列メソッドを使う | ハックノート
        // https://hacknote.jp/archives/21892/
        const l = Array.prototype.slice.call(external_links).filter(o => o.getAttribute("href").match(/^https:\/\/github.*\/devel\/lib\/.*\.py\??/))
        // foobar.pyのあとに"?..."がないリンクもあるので注意
        //https://docs.ansible.com/ansible/2.7/plugins/callback/yaml.html
        // console.log("link: " + l);

        if (l.length) {
            const editlink = l[0].getAttribute("href");
            // console.log(editlink)
            if (editlink) {
                const link = editlink.match(/(https:\/\/github\.com\/ansible\/projects\/ansible\/edit\/devel\/lib\/ansible\/(?:modules|plugins)\/.*?\.py)\??/)
                // console.log("link: " + link[1]);
                return link[1].replace(/edit\/devel/, "blob/" + branch);
            }
        }
    }
    // console.log("=== GitHubLink not found ===");
    return null;
}

/**
 * GitHubのソースのURLを取得する(コレクション関連)
 */
const getCollectionUrl = (branch) => {
    // URLの検査再び(この関数が呼ばれるのはコレクションのURLであることが確定済みのあと)
    const m = document.URL.match(/docs\.ansible\.com\/projects\/ansible\/(?:.*?)\/collections\/(.*?)\/(.*?)\/(.*)_(.*).html/);
    if (m) {
        // console.log("m1: " + m[1]);
        // console.log("m2: " + m[2]);
        // console.log("m3: " + m[3]);
        // console.log("m4: " + m[4]);
        const external_links = document.getElementsByClassName("external");
        // console.log(external_links);
        const link = Array.prototype.slice.call(external_links).filter(i => i.innerHTML.match(/Repository \(Sources\)/))[0].getAttribute("href");
        console.log(link);

        if ((m[1]+'.'+m[2]) === 'ansible.builtin') {
            // coreモジュール(base / builtin)の場合
            if (m[4] === 'module') {
                // baseのモジュール類のURL
                // 例えばtemplate module
                // https://docs.ansible.com/ansible/latest/collections/ansible/builtin/template_module.html
                // https://github.com/ansible/ansible/blob/stable-2.10/lib/ansible/modules/template.py
                return link + '/blob/' + branch + '/lib/ansible/modules/' + m[3] + '.py';
                // "module" -> "modules" (sが増えてる)
            }
            else {
                // module以外はパス名そのまま
                return link + '/blob/' + branch + '/lib/ansible/plugins/'+ m[4] +'/' + m[3] + '.py';
            }
        }
        else {
            // builtin以外
            if (m[4] === 'module') {
                // collectionのモジュール類のURL
                // 例えばansible.posix.firewalld module
                // https://docs.ansible.com/ansible/latest/collections/ansible/posix/firewalld_module.html
                // https://github.com/ansible-collections/ansible.posix/blob/main/plugins/modules/firewalld.py
                return link + '/blob/HEAD/plugins/modules/' + m[3] + '.py';
                // "module" -> "modules" (sが増えてる)
            }
            else {
                // module以外はパス名そのまま
                return link + '/blob/HEAD/plugins/'+ m[4] +'/' + m[3] + '.py';
            }
        }
    }

    return null;
}

/**
 * readthedocs-flyout elementの取得
 * DOMに追加されるまで待機して要素を返す
 *
 * @returns readthedocs-flyout element
 */
const waitForFlyout = () => {
    return new Promise(resolve => {
        // すでに存在するなら即返す
        const flyout = document.querySelector("readthedocs-flyout");
        if (flyout) {
            resolve(flyout);
            return;
        }

        // console.log("wait added to DOM");
        const observer = new MutationObserver(() => {
            const flyout = document.querySelector("readthedocs-flyout");
            if (flyout) {
                observer.disconnect();
                resolve(flyout);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

main();
