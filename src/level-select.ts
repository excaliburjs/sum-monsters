import { LitElement, html, css, unsafeCSS, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import {repeat} from 'lit/directives/repeat.js';

import fa from 'bundle-text:./vendor/fa/css/fork-awesome.css';
import { styleMap } from 'lit/directives/style-map';
import { classMap } from 'lit/directives/class-map';
import { Engine, Vector } from 'excalibur';
import config from './config';
import { LevelSelect } from './levels/level-select';
import { goToPuzzle } from './levels/main-level';

@customElement('level-select')
export class LevelSelectElement extends LitElement {
    static styles = [
        css`
            :host {
                font-family: "PressStart2P", sans-serif;
            }

            .container {
                display: flex;
                flex-wrap: wrap;
                pointer-events: none;
                width: 700px;
                position: absolute;
                transform-origin: 0 0;
                transform: scale(calc(var(--pixel-conversion)), calc(var(--pixel-conversion)));
            }
            button {
                all: unset;
                cursor: pointer;
                pointer-events: all;
                background-color: transparent;
            }

            button[disabled] {
                color: red;
            }

            .level {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 15px;
                width: 55px;
                color: white;
                border-radius: 5px;
                border: solid 2px white;
                margin: 5px;
            }
            .level:focus-visible, .level:hover {
                outline: 5px solid white;
            }
            .fa {
                margin-right: 5px;
            }
        `
    ];

    left = 0;
    top = 0;
    visible: boolean = false;
    puzzles: [string, boolean][] = [];
    engine!: Engine;
    maxPuzzleNumberSolved: number = -1;

    setEngine(engine: Engine) {
        this.engine = engine;
    }

    toggleVisible(visible: boolean) {
        this.visible = visible;
        this.requestUpdate();
    }

    setLevelSelectTopLeft(pos: Vector) {
        const container = this.renderRoot.querySelector('.container') as HTMLElement;
        if (container) {
            this.left = pos.x;
            this.top = pos.y;
            this.requestUpdate();
        }
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this.puzzles = Object.keys(config.puzzles).map(k => {
            return [k, !!localStorage.getItem(k)]
        });

        this.maxPuzzleNumberSolved = -1;
        for (let p = 0; p < this.puzzles.length; p++) {
            if (this.puzzles[p][1] && p > this.maxPuzzleNumberSolved) {
                this.maxPuzzleNumberSolved = p;
            }
        }
        console.log(this.maxPuzzleNumberSolved);
    }

    onSelection = (level: number) => {
        return () => {
            goToPuzzle(this.engine, level);
            this.toggleVisible(false);
        }
    }

    goToTutorial = () => {
        this.engine.goToScene('tutorial')
    }

    render() {
        const styles = {
            visibility: this.visible ? 'visible' : 'hidden',
            left: `${this.left}px`,
            top: `${this.top}px`
        }
        return html`
            <style>${unsafeCSS(fa)}</style>


            <div class="container" style=${styleMap(styles)}>
                <button class="level"
                    @click=${this.goToTutorial}
                    @keydown=${this.goToTutorial}
                ><span>T</span></button>

                ${repeat(this.puzzles, p => p[0], (p, index) => html`
                    <button class="level" 
                        .disabled=${!this.puzzles[index][1] && !(index === (this.maxPuzzleNumberSolved + 1))}
                        @click=${this.onSelection(+p[0])}
                        @keydown=${this.onSelection(+p[0])}>
                        <i class=${classMap({
                            fa: true,
                            'fa-lock': !this.puzzles[index][1] && !(index === (this.maxPuzzleNumberSolved + 1))
                        })} aria-hidden="true"></i>
                        <span>${+p[0] + 1}</span>
                    </button>
                `)}
                
            </div>
        `;
    }
}
