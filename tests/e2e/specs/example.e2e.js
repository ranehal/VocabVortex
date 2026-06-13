import HomePage from '../pageobjects/home.page.js';

describe('VocabVortex Home Page', () => {
    it('should show the correct title', async () => {
        await HomePage.open();
        
        await expect(HomePage.title).toHaveText(
            expect.stringContaining('To get started'));
    });

    it('should have a visible logo', async () => {
        await HomePage.open();
        await expect(HomePage.logo).toBeDisplayed();
    });

    it('should have a documentation link', async () => {
        await HomePage.open();
        await expect(HomePage.documentationLink).toExist();
        await expect(HomePage.documentationLink).toHaveAttribute('href', 'https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app');
    });
});
