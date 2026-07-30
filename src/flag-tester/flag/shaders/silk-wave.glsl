float distFromPole = uv.x;
float amp = uWaveAmplitude * distFromPole * distFromPole;

float t = uTime * uSpinSpeed;

float wave1 = sin(distFromPole * 6.2832 * 3.0 + t * 2.0) * amp;
float wave2 = sin(distFromPole * 6.2832 * 6.0 + t * 3.5 + 1.0) * amp * 0.3;
float wave3 = sin(distFromPole * 6.2832 * 12.0 + t * 5.0 + 2.5) * amp * 0.15;

float yVar = sin(uv.y * 3.14159 + t * 1.5) * 0.5 + 0.5;

transformed.z += (wave1 + wave2 + wave3) * (0.7 + 0.3 * yVar);
