export const generateRandomInteger = (min, max) => {
    return ~~(min + Math.random()*(max + 1 - min))
};