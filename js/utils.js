export function d6() {
    return Math.floor(Math.random() * 6) + 1;
}
export function d6x2() {
    return (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
}
export function d3() {
    return Math.floor(Math.random() * 3) + 1;
}
export function clamp6(roll) {
    return Math.min(Math.max(roll, 1), 6);
}
export function clamp12(roll) {
    return Math.min(Math.max(roll, 1), 12);
}
export async function waitforMsecAsync(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}
export async function waitforClickAsync(content, msec = 20, ontick) {
    content.addEventListener("click", function onclick() {
        content.removeEventListener("click", onclick);
        clicked = true;
    });
    let clicked = undefined;
    return waitforValueAsync(() => clicked, ontick);
}
export async function waitforAnyClickAsync(contents, msec = 20, ontick) {
    let indexClicked = undefined;
    const onChoice = (i) => () => { indexClicked = i; };
    for (var i = 0; i < contents.length; i++) {
        contents[i].addEventListener("click", onChoice(i));
    }
    await waitforValueAsync(() => indexClicked, ontick);
    for (var i = 0; i < contents.length; i++) {
        contents[i].removeEventListener("click", onChoice(i));
    }
}
export async function waitforValueAsync(getValue, ontick) {
    while (true) {
        const value = getValue();
        if (value != undefined)
            break;
        await waitforMsecAsync(20);
        if (ontick != undefined)
            ontick();
    }
}
export function emitEvent(name, detail) {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
}
export function log(...data) {
    const timeOnly = new Date().toISOString().substring(11).replace("Z", " --");
    console.log(timeOnly, ...data);
}
export function isObjectEmpty(objectName) {
    return Object.keys(objectName).length === 0;
}
export function deepFreeze(object) {
    const propNames = Reflect.ownKeys(object);
    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];
        if ((value && typeof value === "object") || typeof value === "function") {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}
//# sourceMappingURL=utils.js.map