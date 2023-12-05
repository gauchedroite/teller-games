import * as GameMain from "./game/main.js";
import * as EditorMain from "./editor/main.js";
import * as IndexMain from "./index.js";
export const render = () => {
    return `
    ${GameMain.render()}
    ${EditorMain.render()}
    ${IndexMain.render()}
`;
};
export const postRender = () => {
    GameMain.postRender();
    EditorMain.postRender();
    IndexMain.postRender();
};
//# sourceMappingURL=layout.js.map