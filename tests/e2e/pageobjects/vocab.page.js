import Page from './page.js';

/**
 * sub page object containing specific selectors and methods for the VocabVortex application
 */
class VocabPage extends Page {
    /**
     * define selectors using getter methods
     */
    get levelSelectors () {
        return $$('button[className*="rounded-xl"]'); // Matches level buttons like A1, A2, etc.
    }

    get startButton () {
        return $('button=Start Learning'); // Assuming there's a button with this text or similar
    }

    get inputField () {
        return $('input[placeholder*="word"]');
    }

    get wordCards () {
        return $$('.rounded-3xl'); // Assuming word cards have this class
    }

    /**
     * Selects a level from the list
     * @param {string} levelName e.g. 'B2'
     */
    async selectLevel (levelName) {
        const levels = await this.levelSelectors;
        for (const level of levels) {
            if (await level.getText() === levelName) {
                await level.click();
                break;
            }
        }
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    open () {
        return super.open('/');
    }
}

export default new VocabPage();
