import { test, expect } from '@playwright/test';

test.describe('PrayogaProof E2E Test Suite', () => {
  test('Landing page loads with hero branding and subject cards', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PrayogaProof/);
    await expect(page.locator('h1')).toBeVisible();

    // Verify 4 subject cards
    await expect(page.getByRole('heading', { name: 'Physics' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Chemistry' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Biology' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mathematics' })).toBeVisible();

    // Verify Coming Soon badges
    await expect(page.getByText('Coming Soon').first()).toBeVisible();
  });

  test('Navigates to Physics and lists all 5 active experiments', async ({ page }) => {
    await page.goto('/subjects/physics');
    await expect(page.getByRole('link', { name: "Ohm's Law" })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Series and Parallel Circuits' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Convex Lens' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Magnetic Field' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Simple Pendulum' })).toBeVisible();
  });

  test('Navigates to Chemistry and lists all active experiments', async ({ page }) => {
    await page.goto('/subjects/chemistry');
    await expect(page.getByRole('link', { name: 'pH Testing' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Natural Indicators' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Paper Chromatography' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Displacement Reaction' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crystallisation' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Basic Laboratory Techniques' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Melting Point Determination' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Boiling Point Determination' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'pH Determination' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Strong vs Weak Acids' })).toBeVisible();
  });

  test('Biology subject route displays Coming Soon message without breaking', async ({ page }) => {
    await page.goto('/subjects/biology');
    await expect(page.getByRole('heading', { name: /Biology Laboratory/i })).toBeVisible();
    await expect(page.getByText(/Biology is on hold for future phases/i)).toBeVisible();
  });

  test('Mathematics subject route displays Coming Soon message without breaking', async ({ page }) => {
    await page.goto('/subjects/mathematics');
    await expect(page.getByRole('heading', { name: /Mathematics Laboratory/i })).toBeVisible();
    await expect(page.getByText(/Mathematics is on hold for future phases/i)).toBeVisible();
  });

  test('Loads Ohm’s Law workspace and interacts with Toolbar and Mode switch', async ({ page }) => {
    await page.goto('/workspace/ohms-law');

    // Verify workspace toolbar and title
    await expect(page.getByText(/Ohm's Law/i).first()).toBeVisible();

    // Verify Guided Mode toggle is present and switch to Free Lab
    const freeLabBtn = page.getByRole('button', { name: /Free/i });
    await expect(freeLabBtn).toBeVisible();
    await freeLabBtn.click();

    // Equipment catalogue should be open in Free Lab
    await expect(page.getByText('Equipment Catalogue')).toBeVisible();
  });

  test('Loads Vernier Callipers workspace and interacts with Toolbar and Mode switch', async ({ page }) => {
    await page.goto('/workspace/vernier-callipers');

    await expect(page.getByText(/Vernier Callipers/i).first()).toBeVisible();

    // Switch to Free Lab
    const freeLabBtn = page.getByRole('button', { name: /Free/i });
    await expect(freeLabBtn).toBeVisible();
    await freeLabBtn.click();

    // Equipment catalogue should be open in Free Lab
    await expect(page.getByText('Equipment Catalogue')).toBeVisible();
  });

  test('Loads Screw Gauge workspace and verifies micrometer interface', async ({ page }) => {
    await page.goto('/workspace/screw-gauge');
    await expect(page.getByText(/Screw Gauge/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Spherometer workspace and verifies curvature measurement setup', async ({ page }) => {
    await page.goto('/workspace/spherometer');
    await expect(page.getByText(/Spherometer/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Beam Balance workspace and verifies dual-pan balance setup', async ({ page }) => {
    await page.goto('/workspace/beam-balance');
    await expect(page.getByText(/Beam Balance/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Parallelogram Law workspace and verifies vector force board', async ({ page }) => {
    await page.goto('/workspace/parallelogram-law');
    await expect(page.getByText(/Parallelogram Law of Vectors/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Limiting Friction workspace and verifies horizontal track', async ({ page }) => {
    await page.goto('/workspace/limiting-friction');
    await expect(page.getByText(/Laws of Limiting Friction/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Inclined Plane workspace and verifies variable-angle ramp', async ({ page }) => {
    await page.goto('/workspace/inclined-plane-friction');
    await expect(page.getByText(/Friction on an Inclined Plane/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Hooke’s Law workspace and verifies helical spring stand', async ({ page }) => {
    await page.goto('/workspace/hookes-law');
    await expect(page.getByText(/Hooke's Law and Spring Constant/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Boyle’s Law workspace and verifies gas cylinder and pressure gauge', async ({ page }) => {
    await page.goto('/workspace/boyles-law');
    await expect(page.getByText(/Boyle's Law/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Resistivity V-I Method workspace and verifies resistance wire board', async ({ page }) => {
    await page.goto('/workspace/resistivity-vi-method');
    await expect(page.getByText(/Resistivity of a Wire Using the V-I Method/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Metre Bridge workspace and verifies Wheatstone metre bridge', async ({ page }) => {
    await page.goto('/workspace/metre-bridge');
    await expect(page.getByText(/Metre Bridge – Determination of Unknown Resistance/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Galvanometer Figure of Merit workspace and verifies half-deflection setup', async ({ page }) => {
    await page.goto('/workspace/galvanometer-figure-of-merit');
    await expect(page.getByText(/Galvanometer Resistance and Figure of Merit/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Galvanometer to Voltmeter workspace and verifies multiplier calibration rig', async ({ page }) => {
    await page.goto('/workspace/galvanometer-voltmeter');
    await expect(page.getByText(/Conversion of Galvanometer into a Voltmeter/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Galvanometer to Ammeter workspace and verifies shunt calibration rig', async ({ page }) => {
    await page.goto('/workspace/galvanometer-ammeter');
    await expect(page.getByText(/Conversion of Galvanometer into an Ammeter/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Concave Mirror workspace and verifies optical bench setup', async ({ page }) => {
    await page.goto('/workspace/concave-mirror-focal-length');
    await expect(page.getByText(/Focal Length of a Concave Mirror/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Convex Mirror workspace and verifies auxiliary lens retro-reflection setup', async ({ page }) => {
    await page.goto('/workspace/convex-mirror-focal-length');
    await expect(page.getByText(/Focal Length of a Convex Mirror/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Concave Lens workspace and verifies compound lens setup', async ({ page }) => {
    await page.goto('/workspace/concave-lens-focal-length');
    await expect(page.getByText(/Focal Length of a Concave Lens/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Optical Prism workspace and verifies spectrometer table setup', async ({ page }) => {
    await page.goto('/workspace/prism-refractive-index');
    await expect(page.getByText(/Refractive Index of a Prism – Minimum Deviation/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads P-N Junction Diode workspace and verifies semiconductor test bench', async ({ page }) => {
    await page.goto('/workspace/pn-junction-diode');
    await expect(page.getByText(/P-N Junction Diode – I-V Characteristics/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Paper Chromatography workspace and inspects paper strip properties', async ({ page }) => {
    await page.goto('/workspace/paper-chromatography');

    await expect(page.getByText(/Paper Chromatography/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();

    // Open Inspector tab if available
    const inspectorTab = page.getByRole('button', { name: 'Inspector', exact: true });
    if (await inspectorTab.isVisible()) {
      await inspectorTab.click();
    }
  });

  test('Loads Basic Laboratory Techniques workspace and verifies burette/balance apparatus', async ({ page }) => {
    await page.goto('/workspace/basic-lab-techniques');
    await expect(page.getByText(/Basic Laboratory Techniques & Volumetric Transfer/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Melting Point Determination workspace and verifies Thiele tube paraffin bath', async ({ page }) => {
    await page.goto('/workspace/melting-point');
    await expect(page.getByText(/Melting Point Determination with Thiele’s Tube/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Boiling Point Determination workspace and verifies Siwoloboff inverted capillary setup', async ({ page }) => {
    await page.goto('/workspace/boiling-point');
    await expect(page.getByText(/Boiling Point Determination by Inverted Capillary Method/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Crystallisation Class 11 workspace and verifies impure sample purification', async ({ page }) => {
    await page.goto('/workspace/crystallisation-class11');
    await expect(page.getByText(/Purification of Impure Samples by Fractional Crystallisation/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads pH Determination workspace and verifies spotting plate and biological samples', async ({ page }) => {
    await page.goto('/workspace/ph-determination');
    await expect(page.getByText(/pH Determination of Fruit Juices, Salts & Buffers/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Loads Strong vs Weak Acids workspace and verifies acid comparator bench', async ({ page }) => {
    await page.goto('/workspace/strong-vs-weak-acids');
    await expect(page.getByText(/Strong vs Weak Acids: Equilibrium Ionisation & Reaction Kinetics/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide', exact: true })).toBeVisible();
  });

  test('Handles 404 route gracefully with return navigation', async ({ page }) => {
    await page.goto('/non-existent-route');
    await expect(page.getByText(/404 - Laboratory Page Not Found/i)).toBeVisible();
    const dashboardBtn = page.getByRole('button', { name: /Back to Dashboard/i });
    await expect(dashboardBtn).toBeVisible();
  });
});
