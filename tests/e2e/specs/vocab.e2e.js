import VocabPage from '../pageobjects/vocab.page.js';

describe('VocabVortex App Functionality', () => {
    beforeEach(async () => {
        await VocabPage.open();
    });

    it('should allow selecting different levels', async () => {
        const targetLevel = 'B2';
        await VocabPage.selectLevel(targetLevel);
        
        // Verify the selected level is active
        const selectedLevel = await $(`button=${targetLevel}`);
        await expect(selectedLevel).toHaveClass(expect.stringContaining('text-white'));
    });

    it('should show word suggestions based on level', async () => {
        await VocabPage.selectLevel('A1');
        const firstLevelWord = await $('span=Apple'); // A1 list starts with Apple
        await firstLevelWord.waitForDisplayed({ timeout: 5000 });
        await expect(firstLevelWord).toBeDisplayed();
    });

    it('should be able to search for a word', async () => {
        const searchInput = await VocabPage.inputField;
        if (await searchInput.isExisting()) {
            await searchInput.setValue('Ephemeral');
            await browser.keys('Enter');
            // Check if the word card appears
            await expect($('h3=Ephemeral')).toBeDisplayed();
        }
    });
});
