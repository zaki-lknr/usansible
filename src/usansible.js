let [ver,collection] = getBranchName();
// console.log("branch name: " + ver);
// console.log("collection: " + collection);
let baseurl;

if (collection) {
    baseurl = getCollectionUrl(ver);
}
else {
    baseurl = getGitHubUrl(ver);
}

if (baseurl) {
    // [View Source]を差し込むGitHubのリンクテキスト位置を取り出し
    let li = document.getElementsByClassName("wy-breadcrumbs-aside")[0]
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

/**
 * バージョン変換テーブル
 *
 * @param {*} version
 * @returns 変換後バージョン
 */
function ansible_version_table(version) {
    let ver;
    switch (version) {
    case "3":
        ver = "2.10";
        break;
    case "4":
        ver = "2.11";
        break;
    case "5":
        ver = "2.12";
        break;
    case "6":
        ver = "2.13";
        break;
    case "7":
        ver = "2.14";
        break;
    case "8":
        ver = "2.15";
        break;
    case "9":
        ver = "2.16";
        break;
    case "10":
        ver = "2.17";
        break;
    case "11":
        ver = "2.18";
        break;
    default:
        ver = version;
        break;
    }
    console.log("version: " + ver);

    return ver;
}

/**
 * target versionをURLから取り出し、GitHubのbranch名に変換
 */
function getBranchName() {
    // target versionをURLから取出し
    let v = document.URL.match(/docs\.ansible\.com\/ansible\/(.*?)\/(modules|plugins|collections)/);
    // console.log(v[1]);
    let ver;
    let collection = false;
    switch (v[1]) {
    case "devel":
        ver = "devel";
        break;
    case "latest":
        ver = "stable-" + ansible_version_table(document.getElementsByClassName("swiftype")[0].getAttribute('content'));
        break;
    default:
        ver = "stable-" + ansible_version_table(v[1]);
    }
    // console.log("branch name: " + ver);

    if (v[2] == "collections") {
        collection = true;
    }
    // console.log("collectoin? " + collection);
    return [ver, collection];
    // let result = [ver, collection];
    // return result;
}

/**
 * GitHubのソースのURLを取得する(旧ページ構成)
 */
function getGitHubUrl(branch) {
    // ページ上部の[Edit on GitHub]の位置からソースのURL取得、モジュールは良いがプラグインが同じやり方だとリンク取得できない。
    // よってページ下部の[!]Hintの項目内にある"edit this document"のリンクから取得する。
    let editlink;
    let external_links = document.getElementsByClassName("external");
    if (external_links) {
        // console.log(external_links);
        // HTMLCollectionで配列メソッドを使う | ハックノート
        // https://hacknote.jp/archives/21892/
        let l = Array.prototype.slice.call(external_links).filter(o => o.getAttribute("href").match(/^https:\/\/github.*\/devel\/lib\/.*\.py\??/))
        // foobar.pyのあとに"?..."がないリンクもあるので注意
        //https://docs.ansible.com/ansible/2.7/plugins/callback/yaml.html
        // console.log("link: " + l);

        if (l.length) {
            editlink = l[0].getAttribute("href");
        }
    }
    if (!editlink) {
        // console.log("=== GitHubLink not found ===");
        return null;
    }
    // console.log(editlink)

    let link = editlink.match(/(https:\/\/github\.com\/ansible\/ansible\/edit\/devel\/lib\/ansible\/(?:modules|plugins)\/.*?\.py)\??/)
    // console.log("link: " + link[1]);
    return link[1].replace(/edit\/devel/, "blob/" + branch);
}

/**
 * GitHubのソースのURLを取得する(コレクション関連)
 */
function getCollectionUrl(branch) {
    // URLの検査再び(この関数が呼ばれるのはコレクションのURLであることが確定済みのあと)
    let m = document.URL.match(/docs\.ansible\.com\/ansible\/(?:.*?)\/collections\/(.*?)\/(.*?)\/(.*)_(.*).html/);
    if (m) {
        // console.log("m1: " + m[1]);
        // console.log("m2: " + m[2]);
        // console.log("m3: " + m[3]);
        // console.log("m4: " + m[4]);

        if ((m[1]+'.'+m[2]) === 'ansible.builtin') {
            // coreモジュール(base / builtin)の場合
            let github_link;
            switch (m[4]) {
            case 'module':
                // baseのモジュール類のURL
                // 例えばtemplate module
                // https://docs.ansible.com/ansible/latest/collections/ansible/builtin/template_module.html
                // https://github.com/ansible/ansible/blob/stable-2.10/lib/ansible/modules/template.py
                github_link = 'https://github.com/ansible/ansible/blob/' + branch + '/lib/ansible/modules/' + m[3] + '.py';
                // "module" -> "modules" (sが増えてる)
                break;
            default:
                // module以外はパス名そのまま
                github_link = 'https://github.com/ansible/ansible/blob/' + branch + '/lib/ansible/plugins/'+ m[4] +'/' + m[3] + '.py';
                break;
            }

            return github_link;
        }
        else {
            let github_link;
            switch (m[4]) {
            case 'module':
                // collectionのモジュール類のURL
                // 例えばansible.posix.firewalld module
                // https://docs.ansible.com/ansible/latest/collections/ansible/posix/firewalld_module.html
                // https://github.com/ansible-collections/ansible.posix/blob/main/plugins/modules/firewalld.py
                github_link = 'https://github.com/ansible-collections/'+ m[1] + '.' + m[2] +'/blob/main/plugins/modules/' + m[3] + '.py';
                // "module" -> "modules" (sが増えてる)
                break;
            default:
                // module以外はパス名そのまま
                github_link = 'https://github.com/ansible-collections/'+ m[1] + '.' + m[2] +'/blob/main/plugins/'+ m[4] +'/' + m[3] + '.py';
                break;
            }

            return github_link;
        }
    }

    return null;
}
