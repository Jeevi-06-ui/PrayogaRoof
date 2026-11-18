# PrayogaProof — Biology Scientific & Mathematical Models

This document details the exact mathematical formulations, biological laws, and biophysical algorithms driving the simulation engines across the PrayogaProof Biology Virtual Laboratory.

---

## 1. Plant Water Relations & Osmosis Engine (`OsmosisLab.tsx`)

### Water Potential & van 't Hoff Thermodynamics
Water movement across cell membranes and semipermeable barriers follows the classical water potential equation:
$$\Psi = \Psi_s + \Psi_p$$
Where:
- $\Psi$: Total water potential ($\text{MPa}$ or $\text{bars}$)
- $\Psi_s$: Solute (osmotic) potential ($\Psi_s \le 0$)
- $\Psi_p$: Turgor (pressure) potential ($\Psi_p \ge 0$)

The solute potential is modeled according to the van 't Hoff relation:
$$\Psi_s = -i \cdot C \cdot R \cdot T$$
- $i$: van 't Hoff ionization factor ($i = 1.0$ for sucrose, $i \approx 1.8$ for $\text{NaCl}$)
- $C$: Molar concentration of solute ($\text{mol/L}$)
- $R$: Universal gas constant ($0.0831\,\text{L}\cdot\text{bar}/(\text{mol}\cdot\text{K})$)
- $T$: Absolute temperature ($298.15\,\text{K}$ at $25^\circ\text{C}$)

### Capillary Column & Hydrostatic Displacement
In the thistle funnel osmometer, solvent flux into the concentrated interior continues until hydrostatic pressure counters osmotic driving force:
$$\Delta h(t) = \Delta h_{\max} \left(1 - e^{-k_{\text{osm}} \cdot t}\right)$$
$$\Delta h_{\max} = \frac{\Delta \Pi}{\rho \cdot g} = \frac{\Pi_{\text{internal}} - \Pi_{\text{external}}}{\rho_{\text{solution}} \cdot g}$$
- For boiled control tissues (membrane protein denaturation), membrane permeability becomes completely porous and non-selective, resulting in:
  $$k_{\text{boiled}} \to 0 \implies \Delta h(t) \equiv 0$$

---

## 2. Optical Physics & Abbe Diffraction Engine (`VirtualMicroscopeStudio.tsx`)

### Abbe Diffraction Limit of Resolution
The minimum resolvable distance $d$ between two specimen points under Kohler illumination is governed by Abbe's diffraction formula:
$$d = \frac{\lambda}{2 \cdot \text{NA}} = \frac{\lambda}{2 \cdot n \cdot \sin \alpha}$$
- $\lambda$: Wavelength of illuminating light ($550\,\text{nm}$ green reference)
- $\text{NA}$: Numerical Aperture of the objective
- $n$: Refractive index of imaging medium ($n = 1.00$ air for $4\text{x}, 10\text{x}, 40\text{x}$; $n = 1.515$ immersion oil for $100\text{x}$)
- $\alpha$: Semi-aperture angle of the objective lens cone

### Real-Time Focal Blur Convolution
The optical defocus blur radius ($\sigma_{\text{blur}}$ in pixels) is calculated dynamically based on objective focal depth and mechanical stage Z-travel:
$$\sigma_{\text{blur}} = \min\left(16, \frac{|\text{focus} - z_{\text{specimen}}|}{100} \times \frac{\text{ObjectivePower}}{10}\right)$$
When immersion oil is omitted on the $100\text{x}$ objective ($NA = 1.25$), refractive mismatch introduces residual spherical aberration:
$$\sigma_{\text{no-oil}} = \max(3.5, \sigma_{\text{blur}} \times 1.8)$$

---

## 3. Enzyme Kinetics & Thermal Denaturation (`SalivaryAmylaseLab.tsx`)

### Biphasic Temperature Bell-Curve Model
Enzyme activity follows Arrhenius acceleration at low temperatures coupled with irreversible thermal denaturation at elevated temperatures:
$$k(T) = A \cdot \exp\left(-\frac{E_a}{R \cdot T}\right) \times \frac{1}{1 + \exp\left(\frac{\Delta H_{\text{denat}} - T \Delta S_{\text{denat}}}{R \cdot T}\right)}$$
- Optimum temperature: $T_{\text{opt}} \approx 37^\circ\text{C} \ (310.15\,\text{K})$
- Complete inactivation: $T \ge 65^\circ\text{C}$ due to tertiary/quaternary active site unfolding.

### pH Dependency (Dicarboxylic Active Site Ionization)
The catalytic velocity follows the Michaelis-Davidsohn bell-shaped curve determined by protonation states of catalytic amino acid residues:
$$v(\text{pH}) = \frac{V_{\max}}{1 + 10^{\text{pK}_1 - \text{pH}} + 10^{\text{pH} - \text{pK}_2}}$$
- Optimum pH: $\text{pH}_{\text{opt}} = 6.8$
- Achromic Point: The time $t_{\text{achromic}}$ required for starch hydrolysis below iodine-detection threshold ($< 0.01\,\text{mg/mL}$ amylose):
  $$t_{\text{achromic}} = \frac{[\text{Starch}]_0}{k_{\text{cat}} \cdot [\text{Enzyme}] \cdot v(\text{pH}) \cdot k(T)}$$

---

## 4. Respiratory Mechanics & Gas Displacement (`SeedRespirationLab.tsx`)

### Aerobic Respiration Stoichiometry
$$\text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2 \longrightarrow 6\text{CO}_2 + 6\text{H}_2\text{O} + 2870\,\text{kJ}$$
$$\text{Respiratory Quotient (RQ)} = \frac{\text{Moles of } \text{CO}_2 \text{ Produced}}{\text{Moles of } \text{O}_2 \text{ Consumed}} = \frac{6}{6} = 1.0$$

### Manometer Liquid Column Displacement
In the closed respirometer, evolved $\text{CO}_2$ is rapidly absorbed by potassium hydroxide:
$$2\text{KOH} + \text{CO}_2 \longrightarrow \text{K}_2\text{CO}_3 + \text{H}_2\text{O}$$
Because $\text{CO}_2$ is precipitated as solid $\text{K}_2\text{CO}_3$, consumption of oxygen leads to a net decrease in internal gas pressure:
$$\Delta P = \frac{\Delta n_{\text{O}_2} \cdot R \cdot T}{V_{\text{flask}}}$$
$$\Delta h(t) = \frac{\Delta P}{\rho_{\text{fluid}} \cdot g} = \alpha_{\text{resp}} \cdot M_{\text{seeds}} \cdot t$$

---

## 5. Photobiology & Limiting Factors (`PhotosynthesisLab.tsx`)

### Blackman's Law of Limiting Factors (1905)
Photosynthetic velocity is constrained by the single environmental parameter in lowest relative abundance:
$$\text{Rate} = \min\left(k_L \cdot I,\; k_C \cdot [\text{HCO}_3^-],\; f_T(T)\right)$$
- Light Irradiance vs. Distance:
  $$I(d) = \frac{P_{\text{lamp}}}{4\pi d^2}$$
- Bubble production rate ($R_{\text{bubbles}}$ in bubbles/min):
  $$R_{\text{bubbles}} = \left\lfloor R_{\max} \cdot \frac{I}{I + K_L} \cdot \frac{[\text{NaHCO}_3]}{[\text{NaHCO}_3] + K_C} \cdot e^{-\frac{(T - 28)^2}{2\sigma_T^2}} \right\rfloor$$

---

## 6. Cytogenetics & Quantitative Inheritance

### Mitotic Index (`MitosisLab.tsx`)
$$\text{MI} = \frac{N_{\text{Prophase}} + N_{\text{Metaphase}} + N_{\text{Anaphase}} + N_{\text{Telophase}}}{N_{\text{Total Cells}}} \times 100\%$$

### Chi-Square ($\chi^2$) Goodness-of-Fit Test (`MendelianGeneticsLab.tsx`)
$$\chi^2 = \sum_{i=1}^{k} \frac{(O_i - E_i)^2}{E_i}$$
- **Degrees of freedom ($df$):** $df = k - 1$
  - Monohybrid ($k=2$): $df = 1$, critical $\chi_{0.05}^2 = 3.841$
  - Dihybrid ($k=4$): $df = 3$, critical $\chi_{0.05}^2 = 7.815$

---

## 7. Cardiovascular Hemodynamics (`HeartCirculationLab.tsx`)

### Cardiac Output Equation
$$\text{CO} = \text{HR} \times \text{SV}$$
- Resting Heart Rate ($\text{HR}$): $72\,\text{beats/min}$
- Resting Stroke Volume ($\text{SV}$): $70\,\text{mL/beat}$
- Normal Resting Cardiac Output: $\approx 5.04\,\text{L/min}$

### Cardiac Cycle Phase Duration ($0.8\,\text{s}$ at $75\,\text{bpm}$)
- Atrial Systole: $0.1\,\text{s}$
- Ventricular Systole: $0.3\,\text{s}$ (Isovolumetric contraction + Rapid ejection)
- Complete Cardiac Diastole: $0.4\,\text{s}$ (Isovolumetric relaxation + Ventricular filling)

---

## 8. Renal Physiology & Ultrafiltration (`NephronLab.tsx`)

### Net Filtration Pressure (NFP)
$$\text{NFP} = \text{GBHP} - (\text{CHP} + \text{BCOP})$$
Where:
- $\text{GBHP}$: Glomerular Blood Hydrostatic Pressure ($\approx 55\,\text{mmHg}$)
- $\text{CHP}$: Capsular Hydrostatic Pressure ($\approx 15\,\text{mmHg}$)
- $\text{BCOP}$: Blood Colloid Osmotic Pressure ($\approx 30\,\text{mmHg}$)
$$\text{NFP} = 55 - (15 + 30) = +10\,\text{mmHg}$$

### Glomerular Filtration Rate (GFR)
$$\text{GFR} = K_f \times \text{NFP} = 12.5\,\text{mL}/(\text{min}\cdot\text{mmHg}) \times 10\,\text{mmHg} = 125\,\text{mL/min} \ (180\,\text{L/day})$$

### Corticomedullary Hyperosmotic Gradient
- Renal Cortex: $300\,\text{mOsm/L}$ (isosmotic)
- Outer Medulla: $600\,\text{mOsm/L}$
- Inner Medullary Hairpin Turn: Up to $1200\,\text{mOsm/L}$ generated by countercurrent multiplication in Henle's loop and urea recycling.

---

## 9. Neurophysiology & Reflex Latency (`ReflexArcLab.tsx`)

### Conduction Velocity & Total Reflex Time
$$t_{\text{total}} = t_{\text{afferent}} + t_{\text{synaptic}} + t_{\text{efferent}} + t_{\text{neuromuscular}}$$
- Sensory Afferent Travel: $t_{\text{aff}} = \frac{d_{\text{afferent}}}{v_{\text{sensory}}} \approx \frac{0.8\,\text{m}}{60\,\text{m/s}} \approx 13.3\,\text{ms}$
- Central Synaptic Delay: $t_{\text{syn}} \approx 0.5 - 1.0\,\text{ms}$ (monosynaptic stretch reflex)
- Motor Efferent Travel: $t_{\text{eff}} = \frac{d_{\text{efferent}}}{v_{\text{motor}}} \approx \frac{0.7\,\text{m}}{70\,\text{m/s}} \approx 10.0\,\text{ms}$
- Total Monosynaptic Knee-Jerk Latency: $\approx 24.5\,\text{ms}$

---

## 10. Ecological Energetics (`EcosystemEnergyFlowLab.tsx`)

### Lindeman's 10% Law of Trophic Efficiency (1942)
$$E_{n+1} = \eta \cdot E_n \quad \text{where } \eta \approx 0.10 \ (10\%)$$
For an incident solar energy flux of $1{,}000{,}000\,\text{J}$:
1. Gross Primary Production (1% capture): $10{,}000\,\text{J}$
2. Primary Consumers (Herbivores): $1{,}000\,\text{J}$
3. Secondary Consumers (Carnivores): $100\,\text{J}$
4. Tertiary Consumers (Top Predators): $10\,\text{J}$

### Pollutant Biomagnification
For non-metabolized lipophilic toxicants (e.g. DDT):
$$C_{n+1} = \beta \cdot C_n \quad \text{where } \beta \approx 10 - 25$$
$$\text{Water } (0.000003\,\text{ppm}) \to \text{Zooplankton } (0.04\,\text{ppm}) \to \text{Small Fish } (0.5\,\text{ppm}) \to \text{Large Fish } (2.0\,\text{ppm}) \to \text{Fish-eating Birds } (25\,\text{ppm})$$
Resulting in an apex magnification factor exceeding $\times 8{,}000{,}000$.
