import { StateCreator } from 'zustand';
import { CombinedSlice, AudioPlayerSlice } from './storeTypes.ts';
import day_anncouncement_1 from '../sounds/announcements/day_announcement_1.mp3';
import day_anncouncement_2 from '../sounds/announcements/day_announcement_2.mp3';
import day_anncouncement_3 from '../sounds/announcements/day_announcement_3.mp3';
import day_anncouncement_4 from '../sounds/announcements/day_announcement_4.mp3';
import day_anncouncement_5 from '../sounds/announcements/day_announcement_5.mp3';
import night_anncouncement_1 from '../sounds/announcements/night_announcement_1.mp3';
import night_anncouncement_2 from '../sounds/announcements/night_announcement_2.mp3';
import night_anncouncement_3 from '../sounds/announcements/night_announcement_3.mp3';
import night_anncouncement_4 from '../sounds/announcements/night_announcement_4.mp3';
import night_anncouncement_5 from '../sounds/announcements/night_announcement_5.mp3';

export const SOUNDS = {
    DAY_1: day_anncouncement_1,
    DAY_2: day_anncouncement_2,
    DAY_3: day_anncouncement_3,
    DAY_4: day_anncouncement_4,
    DAY_5: day_anncouncement_5,
    NIGHT_2: night_anncouncement_1,
    NIGHT_3: night_anncouncement_2,
    NIGHT_4: night_anncouncement_3,
    NIGHT_5: night_anncouncement_4,
    NIGHT_6: night_anncouncement_5,
};

export const createAudioPlayerSlice: StateCreator<CombinedSlice, [], [], AudioPlayerSlice> = (
    set,
) => ({
    currentTrack: null,

    playAudio: (track) =>
        set((state) => {
            console.log('paying sound', track);
            if (!Object.values(SOUNDS).includes(track)) return {};
            if (state.currentTrack) {
                state.currentTrack.pause();
            }
            const audio = new Audio(track);
            audio.play();
            return { currentTrack: audio };
        }),
});
