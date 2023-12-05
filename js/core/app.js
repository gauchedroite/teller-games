import { reviver, replacer } from "./misc.js";
import { rootMan } from "./rootMan.js";
export const setUID = (uid) => state.uid = uid;
export const getUID = () => state === null || state === void 0 ? void 0 : state.uid;
export const NS = "App";
let context = "---";
let api = "";
let name;
//
let title = "";
let error = { hasError: false };
//
export let uiServerVersion;
//
let pageRender;
let pagePostRender;
let rendering = false;
let hardRender = false;
let renderRoot = "app_root";
//
export let state;
let root = new rootMan(window.APP.roots);
export const initialize = (render, postRender, appName) => {
    pageRender = render;
    pagePostRender = postRender;
    name = appName;
    state = {};
    return Promise.resolve();
};
export const render = () => {
    if (!rendering) {
        rendering = true;
        //
        let hasServerError = (serverError() ? "js-server-error" : "");
        let hasFatalError = (fatalError() ? "js-fatal-error" : "");
        //
        let html = pageRender();
        let element = document.getElementById(renderRoot);
        //let markup = `<div id="${renderRoot}" class="js-fadein ${hasServerError} ${hasFatalError}">${html}</div>`;
        let markup = `<div id="${renderRoot}">${html}</div>`;
        if (!hardRender)
            (window.morphdom)(element, markup, {
                getNodeKey: function (node) { return node.id; },
                onBeforeNodeAdded: function (node) { return node; },
                onNodeAdded: function (node) { },
                onBeforeElUpdated: function (fromEl, toEl) {
                    if (fromEl.matches("input[type=text]:focus"))
                        return false;
                    if (fromEl.matches("input[type=number]:focus"))
                        return false;
                    if (fromEl.matches("textarea:focus"))
                        return false;
                    if (fromEl.hasAttribute("js-skip-render-class") && fromEl.classList.contains(fromEl.getAttribute("js-skip-render-class")))
                        return false;
                    if (fromEl.hasAttribute("js-skip-render-not-class") && !fromEl.classList.contains(fromEl.getAttribute("js-skip-render-not-class")))
                        return false;
                    return true;
                },
                onElUpdated: function (el) { },
                onBeforeNodeDiscarded: function (node) { return true; },
                onNodeDiscarded: function (node) { },
                onBeforeElChildrenUpdated: function (fromEl, toEl) { return true; }
            });
        else
            element.outerHTML = markup;
        pagePostRender();
        postRender();
        //
        rendering = false;
        hardRender = false;
    }
};
const postRender = () => {
    document.title = title;
    document.body.id = context.toLowerCase().replace("_", "-");
};
export const renderPartial = (id, markup) => {
    if (!rendering) {
        let element = document.getElementById(id);
        if (element == null)
            return;
        rendering = true;
        (window.morphdom)(element, markup, {
            getNodeKey: function (node) { return node.id; },
            onBeforeNodeAdded: function (node) { return node; },
            onNodeAdded: function (node) { },
            onBeforeElUpdated: function (fromEl, toEl) {
                if (fromEl.matches("input[type=text]:focus"))
                    return false;
                if (fromEl.matches("input[type=number]:focus"))
                    return false;
                if (fromEl.matches("textarea:focus"))
                    return false;
                if (fromEl.hasAttribute("js-skip-render-class") && fromEl.classList.contains(fromEl.getAttribute("js-skip-render-class")))
                    return false;
                if (fromEl.hasAttribute("js-skip-render-not-class") && !fromEl.classList.contains(fromEl.getAttribute("js-skip-render-not-class")))
                    return false;
                return true;
            },
            onElUpdated: function (el) { },
            onBeforeNodeDiscarded: function (node) { return true; },
            onNodeDiscarded: function (node) { },
            onBeforeElChildrenUpdated: function (fromEl, toEl) { return true; }
        });
        rendering = false;
    }
};
export const renderOnNextTick = () => {
    setTimeout(render, 0);
};
export const pauseRender = (pause = true) => {
    rendering = pause;
};
export const prepareRender = (ns, title, renderRootId) => {
    transitionUI();
    if (title.length > 0)
        setPageTitle(title);
    if (ns.length > 0)
        setContext(ns);
    setRenderRoot(renderRootId);
};
export const setHardRender = () => {
    hardRender = true;
};
const setRenderRoot = (id) => {
    if (id == renderRoot)
        return;
    renderRoot = id;
    let pages = [...document.querySelectorAll("#app_root > div")];
    pages.forEach(page => {
        //page.style.opacity = "0";
        page.style.display = "none";
    });
    setTimeout(() => {
        let element = document.getElementById(id);
        element.style.display = "block";
        //element.style.opacity = "1";
    }, 250);
};
export const transitionUI = () => {
    let element = document.getElementById("app_root");
    element.classList.remove("js-fadein");
    element.classList.add("js-waiting");
};
export const untransitionUI = () => {
    let element = document.getElementById("app_root");
    element.classList.add("js-fadein");
    element.classList.remove("js-waiting");
};
export const setPageTitle = (newtitle) => {
    title = `${newtitle} || ${name}`;
};
const setContext = (ns) => {
    context = ns;
};
export const inContext = (ns) => {
    if (context == undefined || ns == undefined)
        return false;
    if (typeof ns === "string")
        return (context == ns);
    else
        return (ns.indexOf(context) != -1);
};
export const setError = (text) => {
    error.hasError = true;
    error.messages.push(text);
    return false; // isValid
};
export const getErrorMessages = () => {
    if (hasNoError())
        return [];
    return error.messages;
};
export const clearErrors = () => {
    error.hasError = false;
    error.status = 0;
    error.messages = [];
};
export const hasError = () => {
    return (error != undefined && error.hasError);
};
export const hasErrorStatus = (errorStatus) => {
    return (error != undefined && error.hasError && error.status == errorStatus);
};
export const hasNoError = () => {
    return !hasError();
};
export const serverError = () => {
    return (hasErrorStatus(500));
};
export const fatalError = () => {
    return (hasErrorStatus(403) || hasErrorStatus(-404));
};
export const uiUpdateRequired = () => {
    return (APP.uiClientVersion.toString() != uiServerVersion);
};
export const apiurl = (url) => {
    return `${root.getDomain()}${api}${url}`;
};
export const url = (resource) => {
    return `${root.getDomain()}${resource}`;
};
const handleFetch = (response) => {
    uiServerVersion = response.headers.get("ui-version");
    if (!response.ok) {
        if (response.status == 304 /*Not Modified*/) {
            return null;
        }
        else if (response.status == 401 /*Unauthorized (authentication error really - requires user to signin)*/) {
            error.hasError = true;
            error.messages = ["Not authenticated"];
            error.status = response.status;
            throw error;
        }
        else if (response.status == 403 /*Forbidden (authorization error really)*/) {
            error.hasError = true;
            error.messages = ["Not authorized"];
            error.status = response.status;
            throw error;
        }
        else if (response.status != 500 /*500 is used for validation error - and it's handled later when json content is available*/) {
            error.hasError = true;
            error.messages = [response.statusText];
            error.status = response.status;
            throw error;
        }
    }
    else {
        if (response.status == 204 /*No Content*/) {
            return null;
        }
    }
    return response;
};
const parseJson = (response) => {
    if (response == null)
        return null;
    return response
        .text()
        .then(text => {
        var json = JSON.parse(text, reviver);
        if (json.hasError /*Error returned by the api exception handler*/) {
            error.hasError = true;
            error.messages = [json.message];
            error.status = 500; /*500 is used for validation error*/
            throw error;
        }
        return json;
    });
};
const catchFetch = (reason) => {
    if (reason.hasError != undefined) {
        //All errors except network failures
        error.hasError = reason.hasError;
        error.messages = reason.messages;
        error.status = reason.status;
        if (error.status == 401 /*Unauthorized (not authenticated or expired)*/) {
        }
        if (error.status == 404 /*Not Found (IIS stopped)*/) {
            root.bump();
        }
        if (error.status == 503 /*Service Not Available (AppPool stopped)*/) {
            root.bump();
        }
    }
    else {
        //"Failed to fetch": Network failures or api server is not responding
        error.hasError = true;
        error.messages = [reason.message];
        error.status = -404;
        root.bump();
    }
    throw reason;
};
const fetchWithRetry = (url, options, retries = 0, delay = 2500) => {
    return window.fetch(url, options)
        .then(response => {
        return response;
    })
        .catch(error => {
        if (retries > 0 && error instanceof TypeError) {
            return new Promise(resolve => setTimeout(resolve, delay))
                .then(() => fetchWithRetry(url, options, retries - 1, delay));
        }
        else {
            throw error;
        }
    });
};
export const POST = (url, body) => {
    return fetchWithRetry(apiurl(url), {
        method: "post",
        headers: {
            "Content-type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(body, replacer)
    })
        .then(handleFetch)
        .then(parseJson)
        .catch(catchFetch);
};
export const GET = (url) => {
    return fetchWithRetry(apiurl(url), {
        method: "get",
        headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        },
        credentials: "include",
        mode: "cors",
    })
        .then(handleFetch)
        .then(parseJson)
        .catch(catchFetch);
};
export const PUT = (url, body) => {
    return fetchWithRetry(apiurl(url), {
        method: "put",
        headers: {
            "Content-type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(body, replacer)
    })
        .then(handleFetch)
        .then(parseJson)
        .catch(catchFetch);
};
export const DELETE = (url, body) => {
    return fetchWithRetry(apiurl(url), {
        method: "delete",
        headers: {
            "Content-type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(body, replacer)
    })
        .then(handleFetch)
        .then(parseJson)
        .catch(catchFetch);
};
export const HEAD = (url) => {
    return fetchWithRetry(apiurl(url), {
        method: "head",
        headers: {},
        credentials: "include",
        mode: "cors"
    })
        .then(handleFetch)
        .catch(catchFetch);
};
export const UPLOAD = (url, body) => {
    return fetchWithRetry(apiurl(url), {
        method: "post",
        headers: {},
        credentials: "include",
        mode: "cors",
        body: body
    })
        .then(handleFetch)
        .then(parseJson)
        .catch(catchFetch);
};
export const DOWNLOAD = (url) => {
    return fetchWithRetry(apiurl(url), {
        method: "get",
        headers: {},
        credentials: "include",
        mode: "cors",
    })
        .then(handleFetch)
        .then(response => response === null || response === void 0 ? void 0 : response.blob())
        .catch(catchFetch);
};
export const download = (url, name, event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    DOWNLOAD(url)
        .then(blob => {
        if (window.navigator.msSaveBlob != undefined) {
            window.navigator.msSaveBlob(blob, name);
        }
        else {
            let objectUrl = window.URL.createObjectURL(blob);
            anchor.href = objectUrl;
            anchor.rel = "noopener";
            anchor.download = name;
            anchor.click();
            setTimeout(() => { window.URL.revokeObjectURL(objectUrl); }, 1000);
        }
    })
        .catch(render);
    return false;
};
export const view = (url, name, event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    let anchor = document.createElement("a");
    document.body.appendChild(anchor);
    DOWNLOAD(url)
        .then(blob => {
        if (window.navigator.msSaveOrOpenBlob != undefined) {
            window.navigator.msSaveOrOpenBlob(blob, name);
        }
        else {
            let objectUrl = window.URL.createObjectURL(blob);
            window.open(objectUrl, "_blank");
            setTimeout(() => { window.URL.revokeObjectURL(objectUrl); }, 1000);
        }
    })
        .catch(render);
    return false;
};
export const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            reject(new Error(`Failed to load script ${src}`));
        };
        document.head.appendChild(script);
    });
};
export const getPageState = (ns, key, defaultValue) => {
    let uid = getUID();
    let id = `${name}-pages-state:${uid}`;
    let pageState = JSON.parse(localStorage.getItem(id));
    if (pageState == undefined || pageState[ns] == undefined || pageState[ns][key] == undefined)
        return defaultValue;
    return pageState[ns][key];
};
export const setPageState = (ns, key, value) => {
    let uid = getUID();
    let id = `${name}-pages-state:${uid}`;
    let pageState = JSON.parse(localStorage.getItem(id));
    if (pageState == undefined)
        pageState = {};
    if (pageState[ns] == undefined)
        pageState[ns] = {};
    pageState[ns][key] = value;
    localStorage.setItem(id, JSON.stringify(pageState));
    return value;
};
//# sourceMappingURL=app.js.map