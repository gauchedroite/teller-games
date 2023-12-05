import { ChoiceKind } from "../iui.js";
import { ChunkKind } from "../igame.js";
import { waitforMsecAsync, waitforClickAsync, waitforValueAsync, waitforAnyClickAsync } from "../../utils.js";
import { NS } from "./story.js";
let UX; // Replaces ${NS} for events
export class UI {
    myStoryInner() { return document.querySelector(".story-inner"); }
    myModal() { return document.querySelector(".modal"); }
    myModalInner() { return document.querySelector(".modal-inner"); }
    myChoicePanel() { return document.querySelector(".choice-panel"); }
    myContent() { return document.querySelector(".content"); }
    myContentInner() { return document.querySelector(".content-inner"); }
    myHeading() { return document.querySelector(".heading"); }
    myHeadingInner() { return document.querySelector(".heading-inner"); }
    myTitleInner() { return document.querySelector(".title-inner"); }
    mySolidInner() { return document.querySelector(".solid-inner"); }
    myNext() { return document.querySelector(".next"); }
    myGame() { return document.querySelector(".game"); }
    constructor(id) {
        this.id = id;
        this.portrait = false;
        this.alertAsync = async (text) => {
            var content = this.myContent();
            content.classList.add("overlay");
            content.style.pointerEvents = "none";
            var next = this.myNext();
            var storyInner = this.myStoryInner();
            var inner = this.myModalInner();
            var panel = inner.querySelector("span");
            panel.innerHTML = "<p>" + text + "</p>";
            let modal = this.myModal();
            modal.classList.add("show");
            const waitToMinimize = (e) => {
                e.stopPropagation();
                if (storyInner.classList.contains("minimized"))
                    storyInner.classList.remove("minimized");
                else
                    storyInner.classList.add("minimized");
            };
            let minimizer = inner.querySelector(".minimizer");
            minimizer.addEventListener("click", waitToMinimize);
            await waitforAnyClickAsync([modal, next]);
            panel.innerHTML = "<div class=\"bounce1\"></div><div class=\"bounce2\"></div>";
            minimizer.removeEventListener("click", waitToMinimize);
            modal.classList.remove("show");
            modal.classList.remove("disable");
            await waitforMsecAsync(250);
            content.classList.remove("overlay");
            content.style.pointerEvents = "";
        };
        this.showChoicesAsync = async (sceneChoices) => {
            let panel = this.myChoicePanel();
            panel.innerHTML = "";
            let ul = document.createElement("ul");
            for (var i = 0; i < sceneChoices.length; i++) {
                let choice = sceneChoices[i];
                var icon = "fa-light fa-location-dot";
                if (choice.kind == ChoiceKind.action)
                    icon = "fa-light fa-bolt-lightning";
                if (choice.kind == ChoiceKind.messageTo)
                    icon = "fa-light fa-user";
                if (choice.kind == ChoiceKind.messageFrom)
                    icon = "fa-light fa-message-dots";
                icon = "fa-solid fa-arrow-right";
                let li = document.createElement("li");
                li.setAttribute("data-kind", choice.kind.toString());
                li.setAttribute("data-id", choice.id.toString());
                li.classList.add("hidden");
                let html = `
                <div class="kind"><div><i class="${icon}"></i></div></div>
                <div class="choice">${choice.text}</div>`;
                if (choice.subtext != undefined) {
                    html = `${html}<div class="choice subtext">${choice.subtext}</div>`;
                }
                li.innerHTML = html;
                ul.appendChild(li);
            }
            panel.appendChild(ul);
            var content = this.myContent();
            content.classList.add("overlay");
            this.setCssVariable("--story-panel-offset", `${panel.offsetHeight}px`);
            let storyInner = this.myStoryInner();
            storyInner.classList.remove("minimized");
            let text = this.myContentInner();
            this.scrollContent(text.parentElement);
            var next = this.myNext();
            next.classList.add("hidden");
            let lis = this.myChoicePanel().querySelectorAll("li");
            let indexClicked = undefined;
            const onChoice = (i) => () => { indexClicked = i; };
            for (var i = 0; i < lis.length; i++) {
                lis[i].addEventListener("click", onChoice(i));
                lis[i].classList.remove("hidden");
            }
            const bc = new BroadcastChannel("editor");
            bc.onmessage = event => indexClicked = event.data.choiceIndex;
            await waitforValueAsync(() => indexClicked);
            var li;
            for (var i = 0; i < lis.length; i++) {
                lis[i].removeEventListener("click", onChoice(i));
                if (i == indexClicked)
                    li = lis[i];
            }
            li.classList.add("selected");
            await waitforMsecAsync(500);
            return {
                kind: parseInt(li.getAttribute("data-kind")),
                id: parseInt(li.getAttribute("data-id")),
                text: ""
            };
        };
        this.hideChoicesAsync = async () => {
            var content = this.myContent();
            content.classList.remove("overlay");
            content.style.pointerEvents = "auto";
            document.body.style.setProperty("--story-panel-offset", "0px");
            this.setCssVariable("--story-panel-offset", "0px");
            // make sure the first blurb will be visible
            var storyInner = this.myStoryInner();
            storyInner.scrollTop = content.offsetTop;
            var text = this.myContentInner();
            text.style.marginBottom = "0";
            text.setAttribute("style", "");
            var next = this.myNext();
            next.classList.remove("hidden");
            await waitforMsecAsync(250);
        };
        this.initSceneAsync = async (data) => {
            this.setTitle(data.title);
            if (data.image == undefined)
                return Promise.resolve();
            return this.changeBackgroundAsync(data.image, undefined);
        };
        this.addBlurbAsync = async (chunk) => {
            let html = this.markupChunk(chunk);
            let content = this.myContent();
            var inner = this.myContentInner();
            var next = this.myNext();
            let div = document.createElement("div");
            div.innerHTML = html;
            let section = div.firstChild;
            if (chunk.kind == ChunkKind.background) {
                if (this.portrait)
                    return;
                let bg = chunk;
                await this.changeBackgroundAsync(bg.asset, undefined);
            }
            else if (chunk.kind == ChunkKind.inline) {
                let inline = chunk;
                section.style.opacity = "0";
                inner.appendChild(section);
                this.scrollContent(inner.parentElement);
                section.style.opacity = "1";
                section.style.transition = "opacity 0.1s ease";
                section.style.animation = "color-cycle 5s infinite";
                let assetName = inline.image;
                if (assetName.indexOf(".") == -1)
                    assetName += ".jpg";
                assetName = this.asset(assetName);
                let image = new Image();
                image.src = assetName;
                await image.decode();
                section.style.animation = "";
                let img = section.firstElementChild;
                img.style.backgroundImage = `url(${assetName})`;
                img.style.height = "100%";
            }
            else if (chunk.kind == ChunkKind.text || chunk.kind == ChunkKind.dialog || chunk.kind == ChunkKind.gameresult) {
                section.style.opacity = "0";
                inner.appendChild(section);
                this.scrollContent(inner.parentElement);
                section.style.opacity = "1";
                section.style.transition = "all 0.915s ease";
                if (chunk.kind == ChunkKind.dialog) {
                    let dialog = chunk;
                    if (dialog.metadata != undefined && dialog.metadata.image != undefined) {
                        let assetName = this.asset(dialog.metadata.image);
                        if (assetName.indexOf(".") == -1)
                            assetName += ".jpg";
                        let head = section.getElementsByClassName("head")[0];
                        let image = new Image();
                        await waitforMsecAsync(100);
                        image.src = assetName;
                        await image.decode();
                        head.style.backgroundImage = "url(" + assetName + ")";
                        head.classList.add("show");
                    }
                }
                let spans = section.querySelectorAll("span");
                if (spans.length == 0) {
                    await waitforClickAsync(content);
                }
                else {
                    await waitforMsecAsync(100);
                    let ispan = 0;
                    await waitforClickAsync(content, 25, () => {
                        if (ispan < spans.length)
                            spans[ispan++].removeAttribute("style");
                    });
                    while (ispan < spans.length)
                        spans[ispan++].removeAttribute("style");
                }
            }
            else if (chunk.kind == ChunkKind.heading) {
                let hchunk = chunk;
                let heading = this.myHeading();
                let inner = this.myHeadingInner();
                inner.innerHTML = html;
                document.body.classList.add("showing-heading");
                if (hchunk.metadata != undefined && hchunk.metadata.class != undefined)
                    heading.classList.add(hchunk.metadata.class);
                await waitforClickAsync(heading);
                document.body.classList.remove("showing-heading");
                if (hchunk.metadata != undefined && hchunk.metadata.class != undefined)
                    heading.classList.remove(hchunk.metadata.class);
                await waitforMsecAsync(500);
            }
            else if (chunk.kind == ChunkKind.doo) {
                let doo = chunk;
                let choices = [];
                choices.push({
                    kind: ChoiceKind.action,
                    id: 0,
                    text: doo.text,
                    metadata: doo.metadata
                });
                await this.showChoicesAsync(choices);
                return this.hideChoicesAsync();
            }
            else if (chunk.kind == ChunkKind.minigame) {
                return this.runMinigameAsync(chunk);
            }
            else if (chunk.kind == ChunkKind.waitclick) {
                return waitforClickAsync(content);
            }
            else if (chunk.kind == ChunkKind.title) {
                this.setTitle(chunk.text);
            }
            else if (chunk.kind == ChunkKind.style) {
                let style = chunk;
                const storyInner = this.myStoryInner();
                if (style.metadata != undefined && style.metadata.class != undefined)
                    storyInner.classList.add(style.metadata.class);
                if (style.metadata != undefined && style.metadata.style != undefined)
                    storyInner.setAttribute("style", style.metadata.style);
            }
            else {
                return;
            }
        };
        this.addBlurbFast = (chunk) => {
            var html = this.markupChunk(chunk)
                .replace(/ style\='visibility:hidden'/g, "")
                .replace(/<span>/g, "")
                .replace(/<\/span>/g, "");
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            if (section == undefined)
                return;
            const contentInner = this.myContentInner();
            contentInner.appendChild(section);
        };
        this.clearBlurb = () => {
            this.myContentInner().innerHTML = "";
        };
        this.render = () => {
            return this.myLayout();
        };
        this.myLayout = () => {
            return `
<div class="solid">
    <div class="solid-inner">
        <div class="graphics">
            <iframe></iframe>
        </div>
        <div class="graphics">
            <iframe></iframe>
        </div>
        <div class="graphics game">
            <iframe></iframe>
        </div>
        <div class="graphics fader"></div>
    </div>
</div>

<div class="story">
    <div class="navbar">
        <div class="navbar-inner">
            <div class="goto-menu">
                <a href="#/menu/${this.id}"><i class="fa-solid fa-bars"></i></a>
            </div>
            <div class="title">
                <div class="title-inner"></div>
            </div>
        </div>
    </div>
    <div class="next">
        <div class="next-inner">
            <i class="fa-solid fa-caret-down"></i>
        </div>
    </div>
    <div class="story-inner">
        <div class="content">
            <div class="content-inner"></div>
        </div>
        <div class="choice-panel">
        </div>
        <div class="modal">
            <div class="modal-inner">
                <span></span>
                <div class="minimizer"><i class="fa-solid fa-caret-down"></i></div>
            </div>
        </div>
        <div class="heading">
            <div class="heading-inner"></div>
        </div>
    </div>
</div>

<div class="story-window hidden">
</div>

<div class="preloader">
    <div class="preloader-inner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
    </div>
</div>
`;
        };
        this.setTitle = (title) => {
            let inner = this.myTitleInner();
            if (inner.innerHTML != title) {
                setTimeout(function () {
                    inner.innerHTML = title;
                    inner.classList.remove("out");
                }, 500);
                inner.classList.add("out");
            }
        };
        this.changeBackgroundAsync = async (assetName, metadata) => {
            if (document.body.classList.contains("portrait"))
                return;
            if (assetName == undefined)
                return;
            assetName = this.sanitize(assetName);
            var solid = this.mySolidInner();
            var zero = solid.children[0];
            var one = solid.children[1];
            var back = (zero.style.zIndex == "0" ? zero : one);
            var front = (zero.style.zIndex == "0" ? one : zero);
            var backFrame = back.firstElementChild;
            var frontFrame = front.firstElementChild;
            var css = assetName.replace(".html", "").replace(".jpg", "").replace(".png", "");
            document.body.setAttribute("data-bg", css);
            if (assetName.indexOf(".") == -1)
                assetName += ".jpg";
            var sceneUrl = assetName;
            if (!assetName.endsWith(".html"))
                sceneUrl = this.doc(`teller-image.html?${assetName}`);
            if (frontFrame.src.indexOf(sceneUrl) != -1)
                return;
            if (sceneUrl == this.previousSceneUrl)
                return;
            this.previousSceneUrl = sceneUrl;
            document.body.classList.add("change-bg");
            back.style.opacity = "0";
            backFrame.setAttribute("src", sceneUrl);
            window.eventHubAction = (result) => {
                if (result.content == "ready")
                    hubActionDone = true;
            };
            let hubActionDone = undefined;
            await waitforValueAsync(() => hubActionDone);
            back.style.opacity = "1";
            front.style.opacity = "0";
            document.body.classList.remove("change-bg");
            await waitforMsecAsync(500); //do not use "transitionend" here as it was failing on me. hardcode the delay instead
            back.style.zIndex = "1";
            front.style.zIndex = "0";
        };
        this.runMinigameAsync = async (chunk) => {
            let minigame = chunk;
            let gameReady = false;
            let choiceMade = false;
            let game = this.myGame();
            let gameFrame = game.firstElementChild;
            let src = this.asset(minigame.url);
            gameFrame.setAttribute("src", src);
            window.eventHubAction = (result) => {
                hubResult = result;
                hubActionDone = true;
            };
            let hubResult;
            let hubActionDone = undefined;
            await waitforValueAsync(() => hubActionDone);
            if (hubResult.ready != undefined) {
                if (choiceMade) {
                    document.body.classList.add("show-game");
                    document.body.classList.remove("change-bg");
                    document.body.classList.remove("disabled");
                }
                gameReady = true;
            }
            else {
                document.body.classList.remove("show-game");
                await this.hideChoicesAsync();
                let text = (hubResult.win == true ? minigame.winText : minigame.loseText);
                return hubResult;
            }
            let choices = [];
            choices.push({
                kind: ChoiceKind.action,
                id: 0,
                text: minigame.text
            });
            await this.showChoicesAsync(choices);
            if (gameReady) {
                document.body.classList.add("show-game");
                document.body.classList.remove("disabled");
            }
            else {
                document.body.classList.add("change-bg");
                document.body.classList.add("disabled");
            }
            choiceMade = true;
        };
        this.markupChunk = (chunk) => {
            let html = [];
            if (chunk.kind == ChunkKind.text) {
                let text = chunk;
                html.push("<div class='section text'>");
                for (var line of text.lines) {
                    html.push(`<p>${line}</p>`);
                }
                html.push("</div>");
            }
            else if (chunk.kind == ChunkKind.dialog) {
                let dialog = chunk;
                let hasImage = (dialog.metadata != undefined && dialog.metadata.image != undefined);
                html.push("<div class='section dialog'>");
                if (hasImage) {
                    html.push(`<div class='head-placeholder'></div>`);
                    html.push(`<div class='head'></div>`);
                    html.push("<div class='text'>");
                }
                html.push(`<h1>${dialog.actor}</h1>`);
                if (dialog.parenthetical != undefined)
                    html.push(`<h2>${dialog.parenthetical}</h2>`);
                for (var line of dialog.lines) {
                    var spans = [].map.call(line, function (char) {
                        return `<span style='visibility:hidden'>${char}</span>`;
                    });
                    html.push(`<p>${spans.join("")}</p>`);
                }
                if (hasImage)
                    html.push("</div>");
                html.push("</div>");
            }
            else if (chunk.kind == ChunkKind.gameresult) {
                let result = chunk;
                html.push("<div class='section result'>");
                html.push(`<p>${result.text}</p>`);
                html.push("</div>");
            }
            else if (chunk.kind == ChunkKind.inline) {
                html.push("<div class='section image'>");
                html.push("<div></div>");
                html.push("</div>");
            }
            else if (chunk.kind == ChunkKind.heading) {
                let heading = chunk;
                html.push(`<h1>${heading.title}</h1>`);
                if (heading.subtitle != undefined)
                    html.push(`<h2>${heading.subtitle}</h2>`);
            }
            return html.join("");
        };
        this.scrollContent = (element) => {
            var start = element.scrollTop;
            var end = (element.scrollHeight - element.clientHeight);
            if (end <= start)
                return;
            var top = start;
            setTimeout(function scroll() {
                top += 10;
                element.scrollTop = top + 1;
                if (top < end)
                    setTimeout(scroll, 10);
            }, 10);
        };
        this.sanitize = (filename) => {
            return filename.replace(/ /g, "%20").replace(/'/g, "%27");
        };
        this.asset = (assetName) => {
            if (this.id == "dev")
                return `repos_game-dev/assets/${this.sanitize(assetName)}`;
            return `repos/game-${this.id}/assets/${this.sanitize(assetName)}`;
        };
        this.doc = (assetName) => {
            if (this.id == "dev")
                return `repos_game-dev/${this.sanitize(assetName)}`;
            return `repos/game-${this.id}/${this.sanitize(assetName)}`;
        };
        this.setCssVariable = (property, value) => {
            //(document.querySelector(":root") as HTMLElement).style.setProperty(property, value)
            document.body.style.setProperty(property, value);
        };
        UX = `${NS}.ux`;
    }
}
//# sourceMappingURL=game-ui.js.map