import { store } from "./main.js";

export function path(route) {
    const prefix = store.mode === "demon" ? "/demons" : "";
    return `${prefix}${route}`;
}