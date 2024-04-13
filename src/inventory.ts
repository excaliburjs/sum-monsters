import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js'

import monsterSheetPng from './images/monsters.png';
import { Level } from './levels/intro-level';
import { Unit, UnitType } from './unit';
import { vec } from 'excalibur';

@customElement('app-inventory')
export class Inventory extends LitElement {
    static styles = [
        css`
            :root {
                --monster-image-path: '';
                --sprite-width: 32px;
            }
            :host {
                font-family: sans-serif;
            }

            .container {
                display: block;
                background-color: black;
                color: white;
                position: absolute;
                right: 0;
                top: 0;
                padding: 1rem;
                font-size: 24px
            }

            ul {
                padding: 0;
            }

            button {
                all: unset;
                cursor: pointer;
            }
            button:hover,button:focus-visible {
                outline: white solid 2px;
            }

            li,button {
                display: flex;
                flex-grow: 1;
            }

            .unit-image {
                background-image: var(--monster-image-path);
                width: 32px;
                height: 32px;
            }

            .dragon {
                background-position: calc(32px * -3) 0;
            }
            .kobold {
                background-position: calc(32px * -4) 0;
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

    setLevel(level: Level) {
        this.level = level;
    }
    
    override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        
        const container = this.renderRoot.querySelector('.container') as HTMLElement;
        container.style.setProperty('--monster-image-path', `url(${monsterSheetPng})`);
    }

    onSelection = (type: UnitType) => {
        return () => {
            const unit = new Unit({type});
            this.level.selectUnit(unit);
        }
    }

    render() {
        return html`
        <div class="container">
            <h2>Inventory</h2>
            <ul>
                <li><button @click=${this.onSelection('dragon')}><div class="unit-image dragon"></div>Dragon:9</button></li>
                <li><button @click=${this.onSelection('orc')}><div class="unit-image orc"></div>Orc:5</button></li>
                <li><button @click=${this.onSelection('goblin')}><div class="unit-image goblin"></div>Goblin:3</button></li>
                <li><button @click=${this.onSelection('kobold')}><div class="unit-image kobold"></div>Kobold:2</button></li>
                <li><button @click=${this.onSelection('rat')}><div class="unit-image rat"></div>Rat:1</button></li>
            </ul>
        </div>`;
    }
}