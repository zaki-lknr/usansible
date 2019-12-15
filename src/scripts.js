// target versionをURLから取出し
let version = document.URL.match(/docs\.ansible\.com\/ansible\/(.*?)\/modules/);
console.log(version[1]);
let ver;
switch (version[1]) {
    case "debug":
        ver = "devel";
        break;
    case "latest":
        ver = "stable-" + document.getElementsByClassName("swiftype")[0].getAttribute('content');
        break;
    default:
        ver = "stable-" + version[1];
}
console.log("branch name: " + ver);

// [View Source]を差し込むGitHubのリンクテキスト位置を取り出し
let li = document.getElementsByClassName("wy-breadcrumbs-aside")[0]

// [Edit on GitHub]の位置を取り出し
// <a href="https://github.com/ansible/ansible/edit/devel/lib/ansible/modules/system/service.py?description=%23%23%23%23%23%20SUMMARY%0A%3C!---%20Your%20description%20here%20--%3E%0A%0A%0A%23%23%23%23%23%20ISSUE%20TYPE%0A-%20Docs%20Pull%20Request%0A%0A%2Blabel:%20docsite_pr" class="fa fa-github"> Edit on GitHub</a>
//let editlink = document.getElementsByClassName("fa-github")[0].getAttribute('href')
let editlinkobj = document.getElementsByClassName("fa-github")[0];
if (!editlinkobj) {
    // version2.5は書式違う
    editlinkobj = document.getElementsByClassName("icon-github")[0];
}
if (!editlinkobj) {
    // console.log("*** not found ***")
    exit;
}
let editlink = editlinkobj.getAttribute("href");

// [Edit on GitHub]のリンクからモジュールのソースを取り出し
let link = editlink.match(/(https:\/\/github\.com\/ansible\/ansible\/edit\/devel\/lib\/ansible\/)(modules\/.*?)\?/)
//console.log("link: " + link[2])
let baseurl = link[1].replace(/edit\/devel/, "blob/" + ver)

// リンクテキストを差し込み
li.innerHTML += ' / <a href="' + baseurl + link[2] + '">View Source</a>'
