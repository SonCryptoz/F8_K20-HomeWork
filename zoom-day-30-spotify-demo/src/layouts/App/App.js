import { Header } from "../Header/Header";
import { Player } from "../Player/Player";
import { Sidebar } from "../Sidebar/Sidebar";
import { BottomNav } from "../BottomNav/BottomNav";

export const AppLayout = () => {
    return `
        ${Header()}

        <div class="app__body flex gap-x-2 px-2 pt-0 min-h-0 overflow-hidden">
            ${Sidebar()}

            <main
                id="page-content"
                class="main-view flex-1 overflow-y-auto overflow-x-hidden"
                style="min-width: 0;"
            >
            </main>
        </div>

        ${Player()}
        ${BottomNav()}
    `;
}