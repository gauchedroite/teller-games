import * as App from "../core/app.js";
import * as Router from "../core/router.js";
import * as Misc from "../core/misc.js";
import { Kind } from "../game/igame-data.js";
import GameData from "../game/game-data.js";
import GameHelper from "../game/game-helper.js";
export const NS = "GED";
let gdata;
let state = {};
let editor_url = "";
let current_moment;
let possible_moments;
let choices;
let gids;
let modalWhat;
let logs = [];
let showGameFrame = true;
const myInputRow = (id, value, label, ph = null, disabled = false) => {
    return `
    <div class="item-content">
        <div class="item-inner">
            ${label ? `<div class="item-title label">${label}</div>` : ""}
            <div class="item-input">
                <input type="text" placeholder="${ph !== null && ph !== void 0 ? ph : ""}" value="${value !== null && value !== void 0 ? value : ""}" id="${NS}_${id}" ${disabled ? "disabled" : `onchange="${NS}.onchange(this)"`}>
            </div>
        </div>
    </div>
    `;
};
const myInputAreaRow = (id, value, ph = null, style = null) => {
    return `
    <div class="item-content">
    <div class="item-inner">
        <div class="item-input">
            <textarea placeholder="${ph !== null && ph !== void 0 ? ph : ""}" spellcheck="false" style="${style !== null && style !== void 0 ? style : ""}font-family: monospace; font-size: small;" id="${NS}_${id}" onchange="${NS}.onchange(this)">${value !== null && value !== void 0 ? value : ""}</textarea>
        </div>
    </div>
    </div>
    `;
};
const mySelectRow = (label, url, disabled = false, text = null, subtitle = null) => {
    return `
    <a href="${url}" title="mySelectRow" class="item-link" ${disabled ? "disabled" : ""}>
        <div class="item-content">
            <div class="item-inner">
                <div class="item-title">${label}</div>
                ${subtitle ? `<div class="item-subtitle">${subtitle}</div>` : ""}
                ${text ? `<div class="item-text">${text}</div>` : ""}
            </div>
        </div>
    </a>
`;
};
const myCheckbox = (id, checked, label) => {
    return `
<label>
    <input type="checkbox" id="${NS}_${id}" ${checked ? "checked" : ""} onchange="${NS}.onchange(this)"> ${label !== null && label !== void 0 ? label : ""}
</label>
`;
};
const layoutCol_Game = () => {
    return `
    <div class="content-block-title">
        <div>Game Info</div>
        <div>
            <a title="Upload Game" href="#" onclick="${NS}.uploadGame();return false;"><i class="fa-regular fa-cloud-arrow-up"></i></a>
        </div>
    </div>
    <div class="list-block">
        <ul>
        <li>${myInputRow("game_id", state.game.id, "ID", "Game ID", true)}</li>
        <li>${myInputRow("game_name", state.game.name, "Name", "Game name")}</li>
        <li>${myInputRow("game_initialstate", state.game.initialstate, "State", "Initial state")}</li>
            <li>${myInputAreaRow("game_text", state.game.text, "details")}</li>
        </ul>
    </div>

    <div class="content-block-title">Game Objects</div>
    <div class="list-block">
        <ul>
            <li>${mySelectRow("Situations", `#/${editor_url}/sits`)}</li>
            <li>${mySelectRow("Actors", `#/${editor_url}/actors`, true)}</li>
            <li>${mySelectRow("State", `#/${editor_url}/state`, true)}</li>
        </ul>
    </div>

    <div class="content-block-title">
        <div>Game</div>
        <div>
            <a href="#/menu/${gdata.gameid}"><i title="Menu" class="fa-regular fa-bars"></i></a>&nbsp;
            <a href="#/story/${gdata.gameid}"><i title="Game" class="fa-regular fa-gamepad-modern"></i></a>
${showGameFrame ? `
            <a href="#" onclick="${NS}.viewGame(false);return false;"><i title="Hide Game" class="fa-regular fa-eye-slash"></i></a>
` : `
            <a href="#" onclick="${NS}.viewGame(true);return false;"><i title="Show Game" class="fa-regular fa-eye"></i></a>
`}
        </div>
    </div>
${showGameFrame ? `
    <div class="content-block-iframe">
    <iframe title="Game" src="#/story/${state.game.id}"></iframe>
    </div>
` : `
    <div class="content-block">
        &nbsp;
    </div>
`}
`;
};
const layoutCol_Situations = () => {
    const sits = state.situations;
    const lines = sits.map(one => `<li>${mySelectRow(`${one.name}`, `#/${editor_url}/sitid=${one.id}`, false, one.when)}</li>`);
    return `
    <div class="content-block-title">
        <div><i class="fa-regular fa-video"></i>&nbsp;Situations</div>
        <div><a href="#" onclick="${NS}.addSituation();return false;"><i title="New Situation" class="fa-regular fa-plus"></i></a></div>
    </div>
    <div class="list-block media-list">
        <ul>${lines.join("")}</ul>
    </div>
`;
};
const layoutCol_Situation = () => {
    const sitid = gids.sitid;
    const sit = state.situations.find(one => one.id == sitid);
    if (!sit)
        return "";
    const scenes = state.scenes.filter(one => one.sitid == sitid);
    const scenelines = scenes.map(one => {
        var _a;
        const selected = one.id == gids.sceneid;
        const isnext = (choices !== null && choices !== void 0 ? choices : []).findIndex(choice => choice.id == one.id) != -1;
        const iscurrent = (_a = one.id == (current_moment === null || current_moment === void 0 ? void 0 : current_moment.parentid)) !== null && _a !== void 0 ? _a : -1;
        const classes = [];
        if (selected)
            classes.push("ted-selected");
        if (isnext)
            classes.push("ted-isnext");
        if (iscurrent)
            classes.push("ted-iscurrent");
        return `<li ${classes.length ? `class="${classes.join(" ")}"` : ""}>${mySelectRow(`${one.name}`, `#/${editor_url}/sceneid=${one.id}`)}</li>`;
    });
    const actors = state.actors.filter(one => one.sitid == sitid);
    const actorlines = actors.map(one => `<li>${mySelectRow(`${one.name}`, `#/${editor_url}/actorid=${one.id}`, true)}</li>`);
    return `
    <div class="content-block-title">
        <div><i class="fa-regular fa-camera-movie"></i>&nbsp;Situation</div>
        <div><a href="#" onclick="${NS}.openModal('sitid');return false;"><i title="Delete Situation" class="fa-regular fa-trash"></i></a></div>
    </div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("sit_name", sit.name, "Name", "Name")}</li>
            <li>${myInputRow("sit_when", sit.when, "When", "Condition")}</li>
            <li>${myInputAreaRow("sit_text", sit.text, "details")}</li>
        </ul>
    </div>

    <div class="content-block-title">
        <div><i class="fa-regular fa-image"></i>&nbsp;Scenes</div>
        <div><a href="#" onclick="${NS}.addScene();return false;"><i title="New Scene" class="fa-regular fa-plus"></i></a></div>
    </div>
    <div class="list-block media-list">
        <ul>${scenelines.join("")}</ul>
    </div>
    
    <div class="content-block-title">
        <div>Actors</div>
        <!--<div><i title="New Actor" class="fa-regular fa-user-plus"></i></div>-->
    </div>
    <div class="list-block media-list">
        <ul>${actorlines.join("")}</ul>
    </div>
`;
};
const layoutCol_Scene = () => {
    const sceneid = gids.sceneid;
    const scene = state.scenes.find(one => one.id == sceneid);
    if (!scene)
        return "";
    const moments = gdata.getMomentsOf(scene);
    const momlines = moments.map(one => {
        var _a;
        const selected = one.id == gids.momentid;
        const isnext = (possible_moments !== null && possible_moments !== void 0 ? possible_moments : []).findIndex(moment => moment.id == one.id) != -1;
        const iscurrent = (_a = one.id == (current_moment === null || current_moment === void 0 ? void 0 : current_moment.id)) !== null && _a !== void 0 ? _a : -1;
        const classes = [];
        if (selected)
            classes.push("ted-selected");
        if (isnext)
            classes.push("ted-isnext");
        if (iscurrent)
            classes.push("ted-iscurrent");
        const commands = GameHelper.getCommands(one.text).join("<br>");
        return `<li ${classes.length ? `class="${classes.join(" ")}"` : ""}>${mySelectRow(`${one.when}`, `#/${editor_url}/momentid=${one.id}`, false, commands)}</li>`;
    });
    const actions = gdata.getActionsOf(scene);
    const actlines = actions.map(one => {
        var _a;
        const selected = one.id == gids.actionid;
        const isnext = (possible_moments !== null && possible_moments !== void 0 ? possible_moments : []).findIndex(moment => moment.id == one.id) != -1;
        const iscurrent = (_a = one.id == (current_moment === null || current_moment === void 0 ? void 0 : current_moment.id)) !== null && _a !== void 0 ? _a : -1;
        const classes = [];
        if (selected)
            classes.push("ted-selected");
        if (isnext)
            classes.push("ted-isnext");
        if (iscurrent)
            classes.push("ted-iscurrent");
        const commands = GameHelper.getCommands(one.text).join("<br>");
        return `<li ${classes.length ? `class="${classes.join(" ")}"` : ""}>${mySelectRow(`${one.when}`, `#/${editor_url}/actionid=${one.id}`, false, commands, one.name)}</li>`;
    });
    return `
    <div class="content-block-title">
        <div><i class="fa-regular fa-image"></i>&nbsp;Scene</div>
        <div><a href="#" onclick="${NS}.openModal('sceneid');return false;"><i title="Delete Scene" class="fa-regular fa-trash"></i></a></div>
    </div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("scene_name", scene.name, null, "Game name")}</li>
            <li>${myInputAreaRow("scene_text", scene.text, "details")}</li>
        </ul>
    </div>

    <div class="content-block-title">
        <div><i class="fa-regular fa-hourglass-clock"></i>&nbsp;Moments</div>
        <div><a href="#" onclick="${NS}.addMoment();return false;"><i title="New Moment" class="fa-regular fa-plus"></i></a></div>
    </div>
    <div class="list-block media-list">
        <ul>${momlines.join("")}</ul>
    </div>

    <div class="content-block-title">
        <div><i class="fa-regular fa-bolt"></i>&nbsp;Actions</div>
        <div><a href="#" onclick="${NS}.addAction();return false;"><i title="New Action" class="fa-regular fa-plus"></i></a></div>
    </div>
    <div class="list-block media-list">
        <ul>${actlines.join("")}</ul>
    </div>
`;
};
const layoutCol_Moment = () => {
    const momentid = gids.momentid;
    const moment = state.moments.find(one => one.id == momentid);
    if (!moment)
        return "";
    return `
    <div class="content-block-title">
        <div><i class="fa-regular fa-hourglass-clock"></i>&nbsp;Moment</div>
        <div><a href="#" onclick="${NS}.openModal('momentid');return false;"><i title="Delete Moment" class="fa-regular fa-trash"></i></a></div>
    </div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("moment_when", moment.when, "When", "Condition")}</li>
        </ul>
    </div>

    <div class="content-block-title"></div>
    <div class="list-block">
    <ul>
        <li>${myInputAreaRow("moment_text", moment.text, "Your story moment here", "height:calc(100vh - 200px); resize:vertical;")}</li>
    </ul>
</div>
    `;
};
const layoutCol_Action = () => {
    const actionid = gids.actionid;
    const action = state.moments.find(one => one.id == actionid);
    if (!action)
        return "";
    return `
    <div class="content-block-title">
        <div><i class="fa-regular fa-bolt"></i>&nbsp;Action</div>
        <div><a href="#" onclick="${NS}.openModal('actionid');return false;"><i title="Delete Action" class="fa-regular fa-trash"></i></a></div>
    </div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("action_when", action.when, "When", "Condition")}</li>
            <li>${myInputRow("action_name", action.name, null, "Name")}</li>
        </ul>
    </div>

    <div class="content-block-title"></div>
    <div class="list-block">
    <ul>
        <li>${myInputAreaRow("action_text", action.text, "Your story action here", "height:calc(100vh - 200px); resize:vertical;")}</li>
    </ul>
</div>
    `;
};
const layoutCol_IDE = () => {
    var _a, _b;
    const state = gdata.state;
    const prevState = JSON.parse(JSON.stringify((_b = (_a = gdata.continueState) === null || _a === void 0 ? void 0 : _a.state) !== null && _b !== void 0 ? _b : {}));
    ;
    var all = new Array();
    for (var property in prevState) {
        all.push({ name: property, prev: prevState[property], now: undefined });
    }
    for (var property in state) {
        var found = false;
        for (var prev of all) {
            if (prev.name == property) {
                prev.now = state[property];
                found = true;
                break;
            }
        }
        if (found)
            continue;
        all.push({ name: property, prev: undefined, now: state[property] });
    }
    all.sort((a, b) => { return a.name.localeCompare(b.name); });
    const rows = all.map(one => {
        let now = one.now;
        let classname = null;
        let title = null;
        if (one.prev == undefined) {
            classname = "new";
        }
        else if (one.now == undefined) {
            classname = "deleted";
            now = one.prev;
        }
        else if (one.prev != one.now) {
            classname = "changed";
            title = `previous value: ${one.prev}`;
        }
        return `<tr ${classname ? `class="${classname}"` : ""}><td>${one.name}</td><td ${title ? `title="${title}"` : ""}>${now}</td></tr>`;
    });
    const current = (current_moment ? `<li class="ted-iscurrent"><a href="${getMomentUrl(current_moment)}">${current_moment.when}</a></li>` : "");
    const nextmoments = (possible_moments !== null && possible_moments !== void 0 ? possible_moments : []).map((one, index) => {
        return `<li class="ted-isnext"><a href="${getMomentUrl(one)}">${one.when}</a></li>`;
    });
    const nextscenes = (choices !== null && choices !== void 0 ? choices : []).map((one, index) => {
        return `<li class="ted-isnext"><a href="#" onclick="${NS}.onclickChoice(${index});return false">${one.text}</a></li>`;
    });
    const loglines = logs
        .filter((one, index) => logs.findIndex(two => (two.id == one.id)) == index)
        .map(one => `<div style="margin:6px 0;"><div style="font-size:75%;opacity:0.5;line-height:1;">${one.time}</div><div style="line-height:1;">${one.line}</div></div>`);
    return `
<div class="page page-ide">
    <div class="content-block-title">
        <div>State</div>
        <div><a href="#" title="layoutCol_IDE" onclick="${NS}.refreshGame();return false;"><i class="fa-regular fa-rotate-right"></i></a></div>
    </div>
    <div class="content-block">
        <table>
            <tr>
                <th>Name</th>
                <th>Value</th>
            </tr>
            ${rows.join("")}
        </table>
    </div>

    <div class="content-block-title">
        <div>Moments</div>
    </div>
    <div class="content-block">
        <ul>
            ${current}
            ${nextmoments.join("")}
        </ul>
    </div>

    <div class="content-block-title">
        <div>Next Scenes</div>
    </div>
    <div class="content-block">
        <ul>
            ${nextscenes.join("")}
        </ul>
    </div>

    <div class="content-block-title">
        <div>Control</div>
    </div>
    <div class="content-block">
        ${myCheckbox("fastStory", gdata.options.fastStory, "Fast Story")}
    </div>

    <div class="content-block-title">
        <div>Log</div>
        <div>
        <a href="#" onclick="${NS}.refreshLog();return false;" id="refresh_log"><i title="Refresh Log" class="fa-regular fa-rotate-right"></i></a>
        <a href="#" onclick="${NS}.clearLog();return false;"><i title="Clear Log" class="fa-regular fa-trash"></i></a>
        </div>
    </div>
    <div id="log_block" class="content-block" style="max-height: 200px; overflow: auto; padding: 0; font-family: monospace">
        <div style="padding: 10px 15px;">
            ${loglines.join("")}
        </div>
    </div>
</div>
`;
};
const layout_Modal = () => {
    if (modalWhat == undefined)
        return "";
    return `
    <div class="modal-overlay modal-overlay-visible" onclick="${NS}.cancelModal()"></div>
    <div class="modal" style="display: block; margin-top: -62px;">
        <div class="modal-inner">
            <div class="modal-title">Delete Game Object</div>
            <div class="modal-text">Are you sure?</div>
        </div>
        <div class="modal-buttons modal-buttons-2">
            <span class="modal-button" onclick="${NS}.cancelModal()">Cancel</span>
            <span class="modal-button modal-button-bold" onclick="${NS}.executeModal()">OK</span>
        </div>
    </div>
`;
};
const pageLayout = (map, ide, modal) => {
    const pages = [];
    map.forEach((value, key) => pages.push(`<div class="page page-${key}">${value}</div>`));
    return `
<div class="pages js-waitable">
    <div class="pages-editor">
        ${pages.join("")}
    </div>
    <div class="pages-ide">
        ${ide}
    </div>
</div>
${modal}
`;
};
const parseArgs = (args) => {
    gids = {};
    args === null || args === void 0 ? void 0 : args.forEach(one => {
        var _a, _b;
        const parts = one.split("=");
        if (((_a = parts.length) !== null && _a !== void 0 ? _a : 0) == 1) {
            if (parts[0] == "sits")
                gids.sits = true;
            else if (parts[0] == "scenes")
                gids.scenes = true;
            else if (parts[0] == "moments")
                gids.moments = true;
            else if (parts[0] == "actions")
                gids.actions = true;
        }
        else if (((_b = parts.length) !== null && _b !== void 0 ? _b : 0) == 2) {
            const id = +parts[1];
            if (parts[0] == "sitid")
                gids.sitid = id;
            else if (parts[0] == "sceneid") {
                gids.sceneid = id;
                const scene = state.scenes.find(one => one.id == gids.sceneid);
                gids.sitid = scene === null || scene === void 0 ? void 0 : scene.sitid;
            }
            else if (parts[0] == "momentid") {
                gids.momentid = id;
                const moment = state.moments.find(one => one.id == gids.momentid);
                gids.sceneid = moment === null || moment === void 0 ? void 0 : moment.parentid;
                const scene = state.scenes.find(one => one.id == gids.sceneid);
                gids.sitid = scene === null || scene === void 0 ? void 0 : scene.sitid;
            }
            else if (parts[0] == "actionid") {
                gids.actionid = id;
                const action = state.moments.find(one => one.id == gids.actionid);
                gids.sceneid = action === null || action === void 0 ? void 0 : action.parentid;
                const scene = state.scenes.find(one => one.id == gids.sceneid);
                gids.sitid = scene === null || scene === void 0 ? void 0 : scene.sitid;
            }
        }
    });
};
const fetchState = async (args) => {
    if (args != undefined && args.length > 0) {
        const id = args[0];
        if (id == "new") {
            debugger;
        }
        else if (gdata == undefined) {
            editor_url = `editor/${id}`;
            gdata = new GameData(id);
            const text = await gdata.fetchGameFileAsync();
            if (text != undefined && text.length > 0)
                gdata.parseGameFile(text);
        }
    }
    state = gdata;
    parseArgs(args);
    return Promise.resolve();
};
const refresh = () => {
    state = gdata;
    App.render();
};
export const fetch = (args) => {
    App.prepareRender(NS, "Editor", "game_editor");
    Router.registerDirtyExit(null);
    fetchState(args)
        .then(App.untransitionUI)
        .then(App.render)
        .catch(App.render);
};
export const render = () => {
    var _a;
    if (!App.inContext(NS))
        return "";
    const map = new Map();
    map.set("game", layoutCol_Game());
    if ((_a = gids.sits) !== null && _a !== void 0 ? _a : false)
        map.set("sits", layoutCol_Situations());
    if (gids.sitid != undefined)
        map.set("sit", layoutCol_Situation());
    if (gids.sceneid != undefined)
        map.set("sceneid", layoutCol_Scene());
    if (gids.momentid != undefined)
        map.set("momentid", layoutCol_Moment());
    if (gids.actionid != undefined)
        map.set("actionid", layoutCol_Action());
    const ide = layoutCol_IDE();
    const modal = layout_Modal();
    return pageLayout(map, ide, modal);
};
export const postRender = () => {
    if (!App.inContext(NS))
        return;
    const logElement = document.querySelector("#log_block div");
    logElement === null || logElement === void 0 ? void 0 : logElement.scrollIntoView(false);
    if (modalWhat == undefined)
        return;
    setTimeout(() => {
        const modalOverlay = document.querySelector(".modal");
        if (modalOverlay && !modalOverlay.classList.contains("modal-in"))
            modalOverlay.classList.add("modal-in");
    }, 10);
};
const getFormState = () => {
    let clone = Misc.clone(state);
    clone.game.name = Misc.fromInputText(`${NS}_game_name`, state.game.name);
    clone.game.initialstate = Misc.fromInputText(`${NS}_game_initialstate`, state.game.initialstate);
    clone.game.text = Misc.fromInputText(`${NS}_game_text`, state.game.text);
    if (gids.sitid != undefined) {
        const sit = state.situations.find(one => one.id == gids.sitid);
        const clone_sit = clone.situations.find(one => one.id == gids.sitid);
        clone_sit.name = Misc.fromInputText(`${NS}_sit_name`, sit.name);
        clone_sit.when = Misc.fromInputText(`${NS}_sit_when`, sit.when);
        clone_sit.text = Misc.fromInputText(`${NS}_sit_text`, sit.text);
    }
    if (gids.sceneid != undefined) {
        const scene = state.scenes.find(one => one.id == gids.sceneid);
        const clone_scene = clone.scenes.find(one => one.id == gids.sceneid);
        clone_scene.name = Misc.fromInputText(`${NS}_scene_name`, scene.name);
        clone_scene.text = Misc.fromInputText(`${NS}_scene_text`, scene.text);
    }
    if (gids.momentid != undefined) {
        const moment = state.moments.find(one => one.id == gids.momentid);
        const clone_moment = clone.moments.find(one => one.id == gids.momentid);
        clone_moment.when = Misc.fromInputText(`${NS}_moment_when`, moment.when);
        clone_moment.text = Misc.fromInputText(`${NS}_moment_text`, moment.text);
    }
    if (gids.actionid != undefined) {
        const action = state.moments.find(one => one.id == gids.actionid);
        const clone_action = clone.moments.find(one => one.id == gids.actionid);
        clone_action.when = Misc.fromInputText(`${NS}_action_when`, action.when);
        clone_action.name = Misc.fromInputText(`${NS}_action_name`, action.name);
        clone_action.text = Misc.fromInputText(`${NS}_action_text`, action.text);
    }
    const options = gdata.options;
    options.fastStory = Misc.fromInputCheckbox(`${NS}_fastStory`, options.fastStory);
    gdata.options = options;
    return clone;
};
export const onchange = (input) => {
    state = getFormState();
    gdata.update_Game(state);
    App.render();
};
export const openModal = (what) => {
    modalWhat = what;
    App.renderOnNextTick();
};
export const cancelModal = () => {
    modalWhat = null;
    App.renderOnNextTick();
};
export const executeModal = () => {
    const what = modalWhat;
    modalWhat = null;
    if (what == "sitid") {
        gdata.deleteSituation(gids.sitid);
        gdata.update_Game(gdata);
        Router.goto(`#/${editor_url}`);
    }
    else if (what == "sceneid") {
        gdata.deleteScene(gids.sceneid);
        gdata.update_Game(gdata);
        Router.goto(`#/${editor_url}/sitid=${gids.sitid}`);
    }
    else if (what == "momentid") {
        gdata.deleteSceneMoment(gids.momentid);
        gdata.update_Game(gdata);
        Router.goto(`#/${editor_url}/sceneid=${gids.sceneid}`);
    }
    else if (what == "actionid") {
        gdata.deleteAction(gids.actionid);
        gdata.update_Game(gdata);
        Router.goto(`#/${editor_url}/sceneid=${gids.sceneid}`);
    }
};
export const addSituation = () => {
    const id = gdata.addSituation();
    Router.goto(`#/${editor_url}/sitid=${id}`);
};
export const addScene = () => {
    const id = gdata.addScene(gids.sitid);
    Router.goto(`#/${editor_url}/sceneid=${id}`);
};
export const addMoment = () => {
    const id = gdata.addMoment(gids.sceneid);
    Router.goto(`#/${editor_url}/momentid=${id}`);
};
export const addAction = () => {
    const id = gdata.addAction(gids.sceneid);
    Router.goto(`#/${editor_url}/actionid=${id}`);
};
const getMomentUrl = (moment) => {
    const mid = moment.id;
    const kind = (moment.kind == Kind.Moment ? "moment" : "action");
    return `#/${editor_url}/${kind}id=${mid}`;
};
const bcgl = new BroadcastChannel("game-loop:");
bcgl.onmessage = event => {
    if (gdata == undefined || !App.inContext(NS))
        return;
    setTimeout(() => {
        var _a, _b;
        if (event.data.op == "SHOWING_CHOICES") {
            possible_moments = (_a = event.data.moments) !== null && _a !== void 0 ? _a : [];
            choices = (_b = event.data.choices) !== null && _b !== void 0 ? _b : [];
            App.render();
        }
        else if (event.data.op == "GAME_START") {
            App.render();
        }
        else if (event.data.op == "SHOWING_MOMENT") {
            current_moment = event.data.moment;
            const url = getMomentUrl(current_moment);
            Router.goto(url);
        }
    }, 0);
};
const bclog = new BroadcastChannel("log:");
bclog.onmessage = event => {
    var _a;
    const data = JSON.parse(JSON.stringify(event.data));
    logs.push(data);
    (_a = document.getElementById("refresh_log")) === null || _a === void 0 ? void 0 : _a.classList.add("is-dirty");
};
export const onclickChoice = (index) => {
    const channel = new BroadcastChannel("editor:select-choice");
    channel.postMessage({ choiceIndex: index });
};
export const viewGame = (view) => {
    showGameFrame = view;
    App.renderOnNextTick();
};
export const refreshGame = () => {
    const channel = new BroadcastChannel("editor:reload-story");
    channel.postMessage({});
};
export const uploadGame = () => {
    App.transitionUI();
    setTimeout(() => {
        gdata.publishGameFileAsync()
            .then(() => {
            App.untransitionUI();
        })
            .catch(() => {
            App.untransitionUI();
            Misc.toastFailure("FAILED to update the game file");
        });
    }, 0);
};
export const clearLog = () => {
    logs = [];
    App.renderOnNextTick();
};
export const refreshLog = () => {
    App.renderOnNextTick();
};
