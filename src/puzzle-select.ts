import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import fa from 'bundle-text:./vendor/fa/css/fork-awesome.css';
import { Engine, Vector } from 'excalibur';
import { styleMap } from 'lit/directives/style-map';

@customElement('puzzle-select')
export class PuzzleSelect extends LitElement {
    static styles = [
        css`
            :host {
                font-family: "PressStart2P", sans-serif;
            }

            .container {
                display: flex;
                flex-wrap: wrap;
                pointer-events: none;
                position: absolute;
                font-size: 8px;
                transform-origin: 0 0;
                transform: scale(calc(var(--pixel-conversion)), calc(var(--pixel-conversion)));
            }
            button {
                all: unset;
                cursor: pointer;
                pointer-events: all;
                background-color: transparent;
            }

            .level {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 5px;
                color: white;
                border-radius: 5px;
                border: solid 1px white;
                margin: 5px;
            }
            .level:focus-visible, .level:hover {
                outline: 1px solid white;
            }
        `
    ];
    engine!: Engine<any>;
    visible: boolean = false;
    left: number = 0;
    top: number = 0;
    setEngine(engine: Engine) {
        this.engine = engine;
    }

    toggleVisible(visible: boolean) {
        this.visible = visible;
        this.requestUpdate();
    }

    setPuzzleSelectTopLeft(pos: Vector) {
        const container = this.renderRoot.querySelector('.container') as HTMLElement;
        if (container) {
            this.left = pos.x;
            this.top = pos.y;
            this.requestUpdate();
        }
    }

    setPuzzleSelectBottomRight(pos: Vector) {
        const container = this.renderRoot.querySelector('.container') as HTMLElement;
        if (container) {
            const rect = container.getBoundingClientRect()
            this.left = pos.x - rect.width;
            this.top = pos.y - rect.height;
            this.requestUpdate();
        }
    }

    goToLevelSelect = () => {
        this.engine.goToScene('levelSelect')
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
                    @click=${this.goToLevelSelect}
                    @keydown=${this.goToLevelSelect}
                ><i class="fa fa-puzzle-piece" aria-hidden="true"></i></button>
            </div>
        `;
    }
}
