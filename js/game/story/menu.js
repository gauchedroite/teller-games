import * as App from "../../core/app.js";
import * as router from "../../core/router.js";
import UserData from "../game-user.js";
export const NS = "GMENU";
let gameid = "";
let showModal = false;
const myLayout = (id, modal) => {
    const doc = (assetName) => {
        if (id == "dev")
            return `repos_game-dev/${assetName}`;
        return `repos/game-${id}/${assetName}`;
    };
    const isAdmin = window.APP.admin;
    const canResume = new UserData(gameid).canResumeGame();
    const lines = [];
    const add = (line) => lines.push(line);
    if (canResume) {
        add(`<li><a href="#/story/${id}">Continuer la partie!</a></li>`);
        add(`<li><a href="#" onclick="${NS}.openmodalNew();return false;">Nouvelle partie...</a></li>`);
    }
    else {
        add(`<li><a href="#/story/${id}">Commencer une partie!</a></li>`);
    }
    if (isAdmin) {
        add(`<li><a href="#/editor/${id}">Editeur</a></li>`);
        add(`<li><a href="#/">Index</a></li>`);
    }
    return `
<div class="solid">
    <iframe title="Menu Background" src="${doc("menu-bg.html")}" class="full-viewport"></iframe>
</div>
<div class="menu-panel">
    <ul>
        ${lines.join("")}
    </ul>
</div>
${modal}
`;
};
const layout_Modal = () => {
    if (!showModal)
        return "";
    return `
<div class="modal">
    <div class="background" onclick="${NS}.closemodal()"></div>
    <div class="content">
        <span class="close" onclick="${NS}.closemodal()">&times;</span>
        <div class="body">
            <p>Êtes-vous certain de vouloir commencer une nouvelle partie?</p>
            <p>Votre partie actuelle sera effacée!</p>
            <div class="yes">
                <button type="button" onclick="${NS}.restartgame()">Oui</button>
            </div>
        </div>
    </div>
</div>
`;
};
const addGameCss = (id) => {
    var _a;
    const cssid = `gamecss_${id}`;
    const cssElement = document.getElementById(cssid);
    if (cssElement != undefined)
        return;
    const tags = document.querySelectorAll("[tag=gamecss]");
    for (let ix = tags.length - 1; ix >= 0; ix--) {
        const tag = tags[ix];
        (_a = tag.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(tag);
    }
    const link = document.createElement("link");
    link.id = cssid;
    link.href = (id != "dev" ? `repos/game-${id}/css/index.css` : `repos_game-dev/css/index.css`);
    link.type = "text/css";
    link.rel = "stylesheet";
    link.setAttribute("tag", "gamecss");
    document.getElementsByTagName("head")[0].appendChild(link);
};
export const fetch = (args) => {
    gameid = (args ? args[0] : "");
    App.prepareRender(NS, "Menu", "game_menu");
    addGameCss(gameid);
    App.render();
};
export const render = () => {
    if (!App.inContext(NS))
        return "";
    const modal = layout_Modal();
    return myLayout(gameid, modal);
};
export const postRender = () => {
    if (!App.inContext(NS))
        return;
};
export const openmodalNew = () => {
    showModal = true;
    App.renderOnNextTick();
};
export const closemodal = () => {
    showModal = false;
    App.renderOnNextTick();
};
export const restartgame = () => {
    showModal = false;
    router.goto(`#/story/${gameid}/restart`, 1);
};
