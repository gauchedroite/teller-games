import * as router from "../core/router.js";
import * as editor from "./editor.js";
window[editor.NS] = editor;
export const startup = () => {
    router.addRoute("^#/editor/?(.*)$", params => editor.fetch(params));
};
export const render = () => {
    return `
    ${editor.render()}
`;
};
export const postRender = () => {
    editor.postRender();
};
