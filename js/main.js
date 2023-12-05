import * as App from "./core/app.js";
import * as Layout from "./layout.js";
//
import * as GameMain from "./game/main.js";
import * as EditorMain from "./editor/main.js";
// Global references to application modules. Used for event handlers.
window[App.NS] = App;
export const startup = async () => {
    await App.initialize(Layout.render, Layout.postRender, "Teller");
    EditorMain.startup();
    // GameMain.startup() needs to be loaded last because it has the "#/" catchall route
    GameMain.startup();
};
//# sourceMappingURL=main.js.map