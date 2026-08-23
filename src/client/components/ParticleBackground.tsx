import { useCallback, useMemo } from 'react';
import Particles, { ParticlesProvider } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import type { Container, Engine, ISourceOptions } from '@tsparticles/engine';
import GameData from '../strings/_gameData';

const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
};

const ParticleBackground = () => {
    const particlesLoaded = useCallback(async (container?: Container) => {
        console.log('Particles container loaded', container);
    }, []);

    const options: ISourceOptions = useMemo(() => {
        const flavourText: string[] = [
            ...GameData.roles.map((role) => role.flavour),
            ...GameData.chars.map((chars) => chars.flavour),
        ];
        // const lengths: { [length: string]: number } = {};
        // flavourText.forEach((text) => {
        //     const current = lengths[String(text.length)];
        //     if (isNaN(current)) {
        //         lengths[String(text.length)] = 1;
        //     } else {
        //         lengths[String(text.length)] = lengths[String(text.length)] + 1;
        //     }
        // });
        // console.log(lengths);
        const getTextBetweenLengths = (min: number, max: number) =>
            flavourText.filter((text) => text.length >= min && text.length < max);
        return {
            fpsLimit: 60,
            fullScreen: {
                enable: true,
                zIndex: -1,
            },
            particles: {
                groups: {
                    sm: {
                        number: { value: 3, density: { enable: true } },
                        size: { value: 200 },
                        move: {
                            enable: true,
                            speed: 1.5,
                            outModes: { default: 'out' },
                        },
                        destroy: {
                            mode: 'split',
                            split: {
                                count: 2,
                            },
                        },
                        shape: {
                            type: 'text',
                            close: true,
                            options: {
                                text: {
                                    close: true,
                                    font: 'Verdana',
                                    style: '',
                                    value: getTextBetweenLengths(10, 30),
                                    weight: '700',
                                },
                            },
                        },
                    },
                    md: {
                        number: { value: 6, density: { enable: true } },
                        size: { value: 300 },
                        move: {
                            enable: true,
                            speed: 1.5,
                            outModes: { default: 'out' },
                        },
                        shape: {
                            type: 'text',
                            close: true,
                            options: {
                                text: {
                                    close: true,
                                    font: 'Verdana',
                                    style: '',
                                    value: getTextBetweenLengths(30, 60),
                                    weight: '700',
                                },
                            },
                        },
                    },
                    lg: {
                        number: { value: 6, density: { enable: true } },
                        size: { value: 400 },
                        move: {
                            enable: true,
                            speed: 1.5,
                            outModes: { default: 'out' },
                        },
                        shape: {
                            type: 'text',
                            close: true,
                            options: {
                                text: {
                                    close: true,
                                    font: 'Verdana',
                                    style: '',
                                    value: getTextBetweenLengths(60, 100),
                                    weight: '700',
                                },
                            },
                        },
                    },
                },
            },
        };
    }, []);

    return (
        <ParticlesProvider init={particlesInit}>
            <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} />
        </ParticlesProvider>
    );
};

export default ParticleBackground;
