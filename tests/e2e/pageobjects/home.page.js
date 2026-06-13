import Page from './page.js';

/**
 * sub page object containing specific selectors and methods for a specific page
 */
class HomePage extends Page {
    /**
     * define selectors using getter methods
     */
    get logo () {
        return $('img[alt="Next.js logo"]');
    }

    get title () {
        return $('h1');
    }

    get documentationLink () {
        return $('=Documentation');
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    open () {
        return super.open('/');
    }
}

export default new HomePage();
