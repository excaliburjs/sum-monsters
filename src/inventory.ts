import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js';

import monsterSheetPng from './images/monsters.png';
import { Level } from './levels/main-level';
import { Unit, UnitType, UnitsConfig } from './unit';
import { Vector } from 'excalibur';
import { SfxrSounds } from './resources';
import { classMap } from 'lit/directives/class-map';

export type InventoryConfig = Record<UnitType, number>;

@customElement('app-inventory')
export class Inventory extends LitElement {
    public counts: Record<UnitType, number> = {
        dragon: 0,
        orc: 0,
        goblin: 0,
        rat: 0,
        knight: 0,
        archer: 0
    } as any;
    public pulse: Record<UnitType, boolean> = {
        dragon: false,
        orc: false,
        goblin: false,
        rat: false,
        knight: false,
        archer: false
    } as any;

    left = 0;
    top = 0;
    static styles = [
        css`
            :root {
                --monster-image-path: '';
                --sprite-width: 32px;
            }
            :host {
                font-family: "PressStart2P", sans-serif;
            }

            .container {
                pointer-events: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                background-color: #42002077;// #8d8d8daa;
                border-radius: 5px;
                color: white;
                position: absolute;
                padding: .5rem;
                font-size: 24px;
                transform-origin: 0 0;
                transform: scale(calc(var(--pixel-conversion) / 3), calc(var(--pixel-conversion) / 3));
            }

            h2 {
                margin-top: 10px;
                margin-bottom: 10px;
            }

            ul {
                padding: 0;
                margin: 0;
                width: 100%;
            }

            button {
                all: unset;
                pointer-events: all;
                cursor: pointer;
                border-radius: 5px;
                background-color: #1e1e1e;
                margin-bottom: 10px;
                padding: 5px;
                border: 2px solid white;
                box-shadow: 0 3px gray;
            }
            button:hover,button:focus-visible {
                outline: white solid 2px;
            }
            button:active {
                transform: translate(0, 4px);
                box-shadow: 0 0 black;
            }

            span {
                margin-right: auto;
            }

            li,button {
                font-size: 20px;
                display: flex;
                flex-grow: 1;
                white-space: nowrap;
                justify-content: center;
                align-items: center;
            }

            @keyframes pulse {
                from {
                    opacity: 0;
                }

                to {
                    opacity: 1;
                }
            }

            .box {
                position: relative;
                box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
                -webkit-transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
            }

            .box::after {
                content: "";
                border-radius: 5px;
                position: absolute;
                z-index: -1;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                box-shadow: 0 0 25px rgba(255, 255, 255, 0.8);
                opacity: 0;
                -webkit-transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
            }

            .box:hover {
                /* -webkit-transform: scale(1.25, 1.25);
                transform: scale(1.25, 1.25); */
            }

            .box:hover::after {
                /* opacity: 1; */
                animation-duration: 1.5s;
                animation-name: pulse;
                animation-iteration-count: infinite;
                animation-direction: alternate;
            }
            .pulse.box::after {
                animation-duration: 1.5s;
                animation-name: pulse;
                animation-iteration-count: infinite;
                animation-direction: alternate;
            }

            .unit-image {
                background-image: var(--monster-image-path);
                width: 32px;
                height: 32px;
            }

            .unit-image:not(:last-child) {
                /* margin-right: -20px; */
            }

            .dragon {
                background-position: calc(32px * -3) 0;
            }
            .orc {
                background-position: calc(32px * -2) 0;
            }
            .goblin {
                background-position: calc(32px * -1) 0;
            }
            .rat {
                background-position: calc(32px * 0) 0;
            }
        `
    ];
    level!: Level;

    constructor() {
        super();
    }

    visible: boolean = false;

    toggleVisible(visible: boolean) {
        this.visible = visible;
        this.requestUpdate();
    }

    setInventoryConfig(config: InventoryConfig) {
        this.counts = config;
        this.requestUpdate();
    }

    getInventoryConfig() {
        return this.counts;
    }

    addToInventory(monster: UnitType) {
        this.counts[monster]++;
        this.requestUpdate();
    }

    setPulse(monster: UnitType, pulse: boolean = true){
        this.pulse[monster] = pulse;
        this.requestUpdate();
    }

    setLevel(level: Level) {
        this.level = level;
    }

    setInventoryPositionTopRight(pos: Vector) {
        const container = this.renderRoot.querySelector('.container') as HTMLElement;
        if (container) {
            const rect = container.getBoundingClientRect()
            this.left = pos.x - rect.width;
            this.top = pos.y;
            this.requestUpdate();
        }
    }

    override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const container = this.renderRoot.querySelector('.container') as HTMLElement;
        container.style.setProperty('--monster-image-path', `url(${monsterSheetPng})`);
    }



    onSelection = (type: UnitType) => {
        return () => {
            if (this.counts[type] > 0) {
                const unit = new Unit({ type });
                if (this.level.currentSelection) {
                    this.level.cancelSelection();
                }
                this.level.selectUnit(unit, true);
                this.counts[type]--;
                SfxrSounds.selectInventory.play();
                this.requestUpdate();
                this.dispatchEvent(new CustomEvent('selection', { detail: type }));
            }
        }
    }

    render() {
        const styles = {
            visibility: this.visible ? 'visible' : 'hidden',
            left: `${this.left}px`,
            top: `${this.top}px`
        }
        return html`
        <div class="container" style=${styleMap(styles)}>
            <h2>SumMons</h2>
            <ul>
                ${Object.entries(this.counts).map(([type, count]) => count > 0 ? html`
                    <li>
                        <button 
                            class=${classMap({
                                box: true,
                                pulse: this.pulse[type as UnitType]
                            })}
                            .title=${'Summoned Value: ' + UnitsConfig[type as UnitType].value.toString()} 
                            @pointerdown=${this.onSelection(type as UnitType)}>
                            <span>${UnitsConfig[type as UnitType].value.toString()}:${type}</span>
                                ${new Array(count).fill(null).map(() =>
                                    html`<div class="unit-image ${type}"></div>`
                                )}
                        </button>
                    </li>
                ` : html``)}
            </ul>
        </div>`;
    }
}
