import { test, expect } from "@playwright/test";

const adminToken = process.env.ADMIN_TOKEN;
const requireManuscript = process.env.E2E_REQUIRE_MANUSCRIPT === "1";

test.describe("Reader flow", () => {
  test.skip(!adminToken, "ADMIN_TOKEN is required for admin endpoints.");

  test("beta applicant -> invite -> read -> survey -> admin review", async ({
    page,
    request,
  }) => {
    const email = `playwright+${Date.now()}@example.com`;

    await page.goto("/beta-readers?src=ig");
    await page.getByLabel("Email").fill(email);
    await page
      .getByLabel("I have read the content notes.")
      .check();
    await page
      .getByLabel("What do you like to read? (Optional)")
      .fill("Literary fiction");
    await page.getByRole("button", { name: "Apply" }).click();
    const applyResponse = await page.waitForResponse((res) => {
      return (
        res.url().includes("/api/reader/apply") &&
        res.request().method() === "POST"
      );
    });
    const applyStatus = applyResponse.status();
    const applyText = await applyResponse.text();
    let applyData: { success?: boolean; error?: string } = {};
    try {
      applyData = JSON.parse(applyText);
    } catch {
      // no-op
    }
    if (!applyResponse.ok() || !applyData.success) {
      throw new Error(
        `Apply failed (status ${applyStatus}): ${
          applyData.error || applyText || "Unknown error"
        }`
      );
    }
    await expect(
      page.getByText("If selected, you'll receive a private access link.")
    ).toBeVisible();

    const approveResponse = await request.post("/api/admin/reader/approve", {
      data: {
        cohortType: "beta",
        program: "beta_partial_v1",
        email,
        adminToken,
      },
    });

    expect(approveResponse.ok()).toBeTruthy();
    const approveData = await approveResponse.json();
    expect(approveData.success).toBeTruthy();
    expect(approveData.token).toBeTruthy();

    const token = approveData.token as string;

    await page.goto(`/r/${token}`);
    await page.waitForURL(/\/read\/partial\/beta_partial_v1/);

    if (requireManuscript) {
      await expect(
        page.getByRole("heading", { name: "Thanks for reading early." })
      ).toBeVisible();
    }

    await page.goto(`/r/${token}/survey`);
    await expect(
      page.getByRole("heading", { name: "2-minute feedback" })
    ).toBeVisible();
    await page
      .getByLabel("Where were you most hooked?")
      .fill("Chapter 1 opener.");
    await page
      .getByLabel("Where were you confused?")
      .fill("No confusion.");
    await page
      .getByLabel("Which character felt most or least real?")
      .fill("Dad felt real.");
    await page
      .getByLabel("Would you keep reading?")
      .selectOption("yes");
    await page.getByLabel("If you stopped, where?").fill("N/A");
    await page.getByRole("button", { name: "Submit feedback" }).click();
    const surveyResponse = await page.waitForResponse((res) => {
      return (
        res.url().includes("/api/reader/survey") &&
        res.request().method() === "POST"
      );
    });
    expect(surveyResponse.ok()).toBeTruthy();
    const surveyData = await surveyResponse.json();
    expect(surveyData.success).toBeTruthy();
    await expect(
      page.getByText("Thanks for the feedback. It means a lot.")
    ).toBeVisible();

    await page.goto(`/admin/reader-metrics?admin=${adminToken}`);
    await expect(
      page.getByRole("heading", { name: "Reader metrics" })
    ).toBeVisible();

    const firstSurveyLink = page
      .locator('a[href^="/admin/reader-surveys/"]')
      .first();
    await expect(firstSurveyLink).toBeVisible();
    await firstSurveyLink.click();
    await expect(
      page.getByRole("heading", { name: "Survey response" })
    ).toBeVisible();
    await expect(page.getByText("Chapter 1 opener.")).toBeVisible();
  });

  test("approved reader -> read -> survey -> admin review", async ({
    page,
    request,
  }) => {
    const email = `playwright-approved+${Date.now()}@example.com`;

    const approveResponse = await request.post("/api/admin/reader/approve", {
      data: {
        cohortType: "beta",
        program: "beta_partial_v1",
        email,
        adminToken,
      },
    });

    expect(approveResponse.ok()).toBeTruthy();
    const approveData = await approveResponse.json();
    expect(approveData.success).toBeTruthy();
    expect(approveData.token).toBeTruthy();

    const token = approveData.token as string;

    await page.goto(`/r/${token}`);
    await page.waitForURL(/\/read\/partial\/beta_partial_v1/);

    if (requireManuscript) {
      await expect(
        page.getByRole("heading", { name: "Thanks for reading early." })
      ).toBeVisible();
    }

    await page.goto(`/r/${token}/survey`);
    await expect(
      page.getByRole("heading", { name: "2-minute feedback" })
    ).toBeVisible();
    await page
      .getByLabel("Where were you most hooked?")
      .fill("Approved flow hook.");
    await page
      .getByLabel("Where were you confused?")
      .fill("No confusion.");
    await page
      .getByLabel("Which character felt most or least real?")
      .fill("Main character felt real.");
    await page
      .getByLabel("Would you keep reading?")
      .selectOption("yes");
    await page.getByLabel("If you stopped, where?").fill("N/A");
    await page.getByRole("button", { name: "Submit feedback" }).click();
    await expect(
      page.getByText("Thanks for the feedback. It means a lot.")
    ).toBeVisible();

    await page.goto(`/admin/reader-metrics?admin=${adminToken}`);
    await expect(
      page.getByRole("heading", { name: "Reader metrics" })
    ).toBeVisible();

    const firstSurveyLink = page
      .locator('a[href^="/admin/reader-surveys/"]')
      .first();
    await expect(firstSurveyLink).toBeVisible();
    await firstSurveyLink.click();
    await expect(
      page.getByRole("heading", { name: "Survey response" })
    ).toBeVisible();
    await expect(page.getByText("Approved flow hook.")).toBeVisible();
  });
});
