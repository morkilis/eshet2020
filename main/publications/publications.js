const PublicationsPage = () => {
    class Publication extends Div {
        constructor(title, year, creds, mag, link, journal, highlight, supOne, supTwo) {
            super({ cls: 'publication' });
            function _openLink() {
                // DON'T change string to 'https'
                if (link.includes('http') || link.includes('www')) {
                    window.open(link);
                }
                else {
                    window.open(`main/publications/${link}`);
                }
            }
            this.year = year;
            const elements = {
                content: div({ cls: "content-div" }).cacheAppend({
                    titleContent: div({ cls: "title" }).cacheAppend({
                        title: paragraph({ text: title, cls: "publication-title bold" }),
                        journal: paragraph({ id: "journal-banner" , text: journal , cls: "bold" })
                    }),
                    creds: div({ text: creds, cls: "creds" }),
                    year: span({ text: ` (${year})`, cls: "year" }),
                    mag: span({ text: mag, cls: "mag" }),
                }),
            };
            if (highlight){
                elements.content.cacheAppend({highlight: div({ text: highlight, cls: "highlight" })});
            }
            if (supOne){
                elements.content.cacheAppend({supOne: anchor({ text: "Supplementary 1", href: supOne, cls: "sup-btn" })});
            }
            if (supTwo){
                elements.content.cacheAppend({supTwo: anchor({ text: "Supplementary 2", href: supTwo, cls: "sup-btn" })});
            }
            this.cacheAppend(elements).click(_openLink);
        }
    }
    class Journal extends Anchor {
        constructor(title, link) {
            super({ cls: 'journal', href: link });
            this.text(title);
            this.target('_blank');
            console.log(`  new Journal(${title}: ${typeof title}, ${link}: ${typeof link}. this:`, this)
        }
    }
    async function init() {
        console.log('PublicationsPage init');
        const { selected: selectedData, publications: publicationsData, journals: journalsData } = await fetchDict('main/publications/publications.json');
        const publications = [];
        const selected = [];
        const journals = [];
        for (let title of selectedData) {
            let { year, creds, mag, link, journal, highlight, supOne, supTwo } = publicationsData[title];
            selected.push(new Publication(title, year, creds, mag, link, journal, highlight, supOne, supTwo));
        }
        for (let [title, { year, creds, mag, link, journal, highlight, supOne, supTwo }] of dict(publicationsData).items()) {
            publications.push(new Publication(title, year, creds, mag, link, journal, highlight, supOne, supTwo));
        }
        console.log('journalsData:', journalsData)
        for (let [title, { link }] of dict(journalsData).items()) {
            journals.push(new Journal(title, link));
        }
        
        const yearToPublication = {};
        for (let publication of publications) {
            if (publication.year in yearToPublication) {
                yearToPublication[publication.year].push(publication);
            }
            else {
                yearToPublication[publication.year] = [publication];
            }
        }
        const years = [];
        // const selectedPublicationsElem = div({ cls: 'year' }).append(elem({ tag: 'h3' }).text('Selected Publications'));
        // for (let publication of selected) {
        //     selectedPublicationsElem.append(publication);
        // }
        // years.push(selectedPublicationsElem);
        for (let year of Object.keys(yearToPublication).reverse()) {
            let yearDiv = div({ cls: 'year' }).append(elem({ tag: 'h3' }).text(year), ...yearToPublication[year]);
            years.push(yearDiv);
        }

        console.log('Building publication-page. ...journals:', ...journals)
        Home.empty().class('publications-page')
            .append(
                elem({ tag: 'section', cls: 'main-cls page-intro' }).append(
                    elem({ tag: 'h1', cls: 'page-title nine-first', text: 'Publications' })    
                ), elem({ tag: 'section', cls: 'main-cls' }).append(
                    div({ cls: 'publications-container nine-first' }).append(...years),
                    div({ cls: 'side-bar scientific-journals' }).append(
                        elem({ tag: 'h3', text: 'Scientific Journals' }),
                        ...journals)
                )
            );
    }
    return { init };
};
