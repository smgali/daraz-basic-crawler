const Apify = require("apify");

Apify.main(async () => {
  const { message } = await Apify.getInput();
  const requestQueue = await Apify.openRequestQueue();
  await requestQueue.addRequest({
    url: "https://www.daraz.pk/multi-function-printers/",
  });
  let keyword_ = "multi-function-printer";

  const crawler = new Apify.PuppeteerCrawler({
    requestQueue,
    launchContext: {
      launchOptions: {
        headless: true,
      },
    },

    // Stop crawling after several pages
    maxRequestsPerCrawl: 50,
    handlePageFunction: async ({ request, page }) => {
      if (
        request.url == "https://www.daraz.pk/multi-function-printers/" ||
        request.url == "https://www.daraz.pk/multi-function-printers"
      ) {
        const infos = await Apify.utils.enqueueLinks({
          page,
          requestQueue,
          selector: ".cRjKsc > a",
        });
      } else {
        let title_ = await page.$eval(".pdp-mod-product-badge-title", (el) => {
          return el.innerHTML;
        });
        let price_ = await page.$eval(".pdp-product-price > span", (el) => {
          return el.innerHTML;
        });
        let address_ = await page.$eval(".location__address", (el) => {
          return el.innerHTML;
        });
        let scrapedData = {
          title: title_,
          url: request.url,
          description: "",
          keyword: keyword_,
          price: price_,
          address: address_,
        };
        await Apify.pushData(scrapedData);
      }
    },

    handleFailedRequestFunction: async ({ request }) => {
      console.log(`Request ${request.url} failed too many times.`);
    },
  });

  await crawler.run();

  console.log("Crawler finished.");
});
