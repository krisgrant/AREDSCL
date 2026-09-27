import { store } from "./main.js";

export function path(route) {
    let prefix = "";

    if (store.mode === "demon") {
        prefix = "/demons";
    } else if (store.mode === "teeth") {
        prefix = "/teeth";
    }

    return `${prefix}${route}`;
}