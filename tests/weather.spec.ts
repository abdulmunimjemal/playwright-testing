const { test, expect } = require("@playwright/test");

test.describe("Weather Website", () => {
  test("Search for weather in a city", async ({ page }) => {
    await page.goto("https://weather.com/", {
      waitUntil: "domcontentloaded",
    });

    // Wait for the input field to appear
    await page.waitForSelector("#LocationSearch_input");

    const city = "Addis Ababa, Ethiopia";
    await page.fill("#LocationSearch_input", city);
    // no "enter" needed
    const firstResultSelector =
      "#LocationSearch_listbox > button:first-child";
    await page.waitForSelector(firstResultSelector);
    await page.click(firstResultSelector);

    const cityNameHeader = await page.textContent(
      ".CurrentConditions--location--1YWj_"
    );
    expect(cityNameHeader).toContain("Addis Ababa");

    await page.screenshot({
      path: "weather_results.png",
      fullPage: true,
      // don't wait until everything is loaded due to internet in ET
      waitUntil: "domcontentloaded",
    });
    console.log("Screenshot taken: weather_results.png");

    const weatherInfo = await page.textContent(
      ".CurrentConditions--columns--30npQ"
    );
    console.log(`Weather information extracted: ${weatherInfo}`);
    expect(weatherInfo).not.toBeNull();

    await page.pdf({
      path: "weather_report.pdf",
      format: "A4",
      waitUntil: "domcontentloaded",
    });
    console.log("PDF report generated: weather_report.pdf");
    await page.route(
      "https://api.weather.com/v3/wx/forecast/daily/5day",
      (route) => {
        route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            forecasts: [
              {
                day: "Monday",
                temperature: 25,
                description: "Sunny",
              },
              {
                day: "Tuesday",
                temperature: 22,
                description: "Cloudy",
              },
              {
                day: "Wednesday",
                temperature: 23,
                description: "Partly Cloudy",
              },
              {
                day: "Thursday",
                temperature: 24,
                description: "Rainy",
              },
              {
                day: "Friday",
                temperature: 26,
                description: "Sunny",
              },
            ],
          }),
        });
      }
    );
    await page.waitForTimeout(3000);
  });
});
