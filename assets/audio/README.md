# Audio Assets

This directory contains ambient sounds and audio samples for the exhibitions.

## Audio Files Structure

- `ambient/` - Background ambient sounds
- `effects/` - Sound effects for interactions
- `generated/` - Procedurally generated audio (Web Audio API)

## Usage

All audio is handled through the unified AudioSystem.js which provides:

- Consistent volume control
- Audio toggle functionality (defaults to OFF)
- Web Audio API synthesis for real-time audio generation
- Ambient sound playback
- Interactive sound effects

## File Formats

- Primary: OGG Vorbis (broad browser support)
- Fallback: MP3 (compatibility)
- Real-time: Web Audio API synthesis
