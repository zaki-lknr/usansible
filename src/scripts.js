let ver = getBranchName();
let baseurl = getGitHubUrl(ver);
// [View Source]を差し込むGitHubのリンクテキスト位置を取り出し
let li = document.getElementsByClassName("wy-breadcrumbs-aside")[0]


// リンクテキストを差し込み
li.innerHTML += ' / <a href="' + baseurl + '">View Source</a>'


/**
 * target versionをURLから取り出し、GitHubのbranch名に変換
 */
function getBranchName() {
    // target versionをURLから取出し
    let v = document.URL.match(/docs\.ansible\.com\/ansible\/(.*?)\/(?:modules|plugins)/);
    console.log(v[1]);
    let ver;
    switch (v[1]) {
    case "devel":
        ver = "devel";
        break;
    case "latest":
        ver = "stable-" + document.getElementsByClassName("swiftype")[0].getAttribute('content');
        break;
    default:
        ver = "stable-" + v[1];
    }
    console.log("branch name: " + ver);
    return ver;
}

/**
 * GitHubのソースのURLを取得する
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
        console.log("=== link not found ===");
        return null;
    }
    // console.log(editlink)

    let link = editlink.match(/(https:\/\/github\.com\/ansible\/ansible\/edit\/devel\/lib\/ansible\/(?:modules|plugins)\/.*?\.py)\??/)
    // console.log("link: " + link[1]);
    return link[1].replace(/edit\/devel/, "blob/" + branch);
}