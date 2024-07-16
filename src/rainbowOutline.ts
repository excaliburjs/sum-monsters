import { Engine } from "excalibur";

// identity tagged template literal lights up glsl-literal vscode plugin
const glsl = (x: any) => x[0];

export function createRainbowOutlineMaterial(engine: Engine) {
    const outline = glsl`#version 300 es
    precision mediump float;
    
    uniform float u_time_ms;
    uniform sampler2D u_graphic;

    in vec2 v_uv;
    out vec4 fragColor;
    
    vec3 hsv2rgb(vec3 c){
    vec4 K=vec4(1.,2./3.,1./3.,3.);
        return c.z*mix(K.xxx,clamp(abs(fract(c.x+K.xyz)*6.-K.w)-K.x, 0., 1.),c.y);
    }

    // Inigo Quilez pixel art filter https://jorenjoestar.github.io/post/pixel_art_filtering/
    vec2 uv_iq(in vec2 uv, in vec2 texture_size) {
        vec2 pixel = uv * texture_size;
        
        vec2 seam=floor(pixel+.5);
        vec2 dudv=fwidth(pixel);
        pixel=seam+clamp((pixel-seam)/dudv,-.5,.5);
        
        return pixel/texture_size;
    }
    
    void main() {
        const float TAU = 6.28318530;
        const float steps = 8.0; // up/down/left/right pixels
        float radius = 2.0;
        float time_sec = u_time_ms / 1000.;
        
        vec3 outlineColorHSL = vec3(sin(time_sec/2.0) * 1., 1., 1.);
        vec2 aspect = 1.0 / vec2(textureSize(u_graphic, 0));
        
        for (float i = 0.0; i < TAU; i += TAU / steps) {
            // Sample image in a circular pattern
            vec2 offset = vec2(sin(i), cos(i)) * aspect * radius;
            vec4 col = texture(u_graphic, v_uv + offset);
        
            // Mix outline with background
            float alpha = smoothstep(0.5, 0.7, col.a);
            fragColor = mix(fragColor, vec4(hsv2rgb(outlineColorHSL), 1.0), alpha); // apply outline
        }
        
        // Overlay original texture
        ivec2 size = textureSize(u_graphic, 0);
        vec4 mat = texture(u_graphic, uv_iq(v_uv, vec2(size)));
        float factor = smoothstep(0.5, 0.7, mat.a);
        fragColor = mix(fragColor, mat, factor);
    }
    `;
    return engine.graphicsContext.createMaterial({
        name: 'outline',
        fragmentSource: outline
    });
}