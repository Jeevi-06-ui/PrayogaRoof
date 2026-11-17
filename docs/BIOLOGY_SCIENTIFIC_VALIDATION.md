# PrayogaProof — Biology Scientific Models & Pedagogical Validation

**Branch:** `hitesh-biology`  
**Lead:** Hitesh  
**Standard Disclaimer:**  
> **"SIMULATED EDUCATIONAL MODEL — NOT AN ACTUAL LABORATORY MEASUREMENT."**  
> All mathematical formulations, kinetic algorithms, and biochemical rules implemented in PrayogaProof Biology are calibrated to reflect verified biological theory and CBSE/NCERT curricular standards while remaining computationally lightweight, deterministic, and free of hazardous procedures.

---

## 1. Osmosis & Cell Water Potential (Experiment 1 Flagship)

### Governing Equations
1. **Thermodynamic Water Potential Equation:**
   $$\Psi = \Psi_s + \Psi_p + \Psi_w$$
   *(Under standard atmospheric laboratory conditions, gravitational potential $\Psi_w$ is negligible.)*
   
2. **Solute Potential (van 't Hoff Relation):**
   $$\Psi_s = -i \cdot C \cdot R \cdot T$$
   - $i$: van 't Hoff dissociation factor ($1.0$ for non-ionizing sucrose, $2.0$ for $\text{NaCl}$).
   - $C$: Solute concentration in $\text{mol/L}$ ($\text{M}$).
   - $R$: Ideal gas constant ($0.083145\text{ L}\cdot\text{bar}/(\text{mol}\cdot\text{K})$).
   - $T$: Absolute temperature in Kelvin ($298.15\text{ K} = 25^\circ\text{C}$).
   - Unit conversion: $1\text{ bar} = 0.1\text{ MPa}$.

3. **Net Transmembrane Volumetric Flux ($J_v$):**
   $$J_v = L_p \cdot (\Delta \Psi) = L_p \cdot [(\Psi_{\text{ext}} - \Psi_{\text{int}})]$$
   - $L_p$: Membrane hydraulic conductivity ($\mu\text{m}/(\text{s}\cdot\text{bar})$).
   - Positive $J_v$: Endosmosis (water entry).
   - Negative $J_v$: Exosmosis (water exit).

4. **Cell Volume Relaxation Kinetics:**
   $$V(t) = V_{\infty} - (V_{\infty} - V_0) \cdot e^{-k \cdot t}$$
   - Plant Cell Wall Constraint: Expansion is bounded by the rigid cellulosic wall ($V_{\max} \approx 1.12 \times V_0$). Excess hydrostatic wall pressure constitutes turgor pressure ($\Psi_p > 0$).
   - Plasmolysis Criterion: If $C_{\text{ext}} > C_{\text{int}}$, $\Psi_p = 0$. The protoplast shrinks away from the cell wall ($V \to 0.65 \times V_0$).

---

## 2. Microscope Optical Physics (Microscope Studio)

### Governing Equations
1. **Abbe Diffraction Limit (Optical Resolving Power):**
   $$d = \frac{\lambda}{2 \cdot \text{NA}}$$
   - $d$: Minimum resolvable separation distance ($\mu\text{m}$).
   - $\lambda$: Wavelength of illuminating light ($\approx 0.55\ \mu\text{m}$ for green-yellow daylight filter).
   - $\text{NA}$: Numerical Aperture of objective lens ($\text{NA} = n \sin \alpha$).
     - $4\times$ Scanner: $\text{NA} = 0.10 \implies d \approx 2.75\ \mu\text{m}$.
     - $10\times$ Low Power: $\text{NA} = 0.25 \implies d \approx 1.10\ \mu\text{m}$.
     - $40\times$ High Dry: $\text{NA} = 0.65 \implies d \approx 0.42\ \mu\text{m}$.
     - $100\times$ Oil Immersion: $\text{NA} = 1.25$ (with cedarwood oil, $n = 1.515$) $\implies d \approx 0.22\ \mu\text{m}$ (sub-micron resolution).

2. **Field of View (FOV) Scaling:**
   $$\text{FOV}_{\text{diameter}} = \frac{\text{Field Number (FN)}}{M_{\text{objective}}}$$
   - For standard $18\text{ mm}$ eyepiece: $4\times \to 4500\ \mu\text{m}$, $10\times \to 1800\ \mu\text{m}$, $40\times \to 450\ \mu\text{m}$, $100\times \to 180\ \mu\text{m}$.

3. **Depth of Field Blur Convolution:**
   $$\Delta z = |z_{\text{stage}} - z_{\text{specimen}}|$$
   $$\text{Blur}_{\text{radius}} = \min\left(25\text{ px},\ \Delta z \cdot S_{\text{objective}}\right)$$
   Where sensitivity multiplier $S_{\text{objective}}$ scales sharply with $\text{NA}^2$, reproducing the tight focal plane of high-power lenses.

---

## 3. Enzyme Kinetics & Thermal Denaturation (Experiment 3)

1. **Michaelis-Menten Velocity with Temperature Dependence:**
   $$v = \frac{V_{\max}(T, \text{pH}) \cdot [S]}{K_m + [S]}$$
2. **Arrhenius Temperature Scaling & High-Temp Inactivation:**
   $$V_{\max}(T) = V_0 \cdot Q_{10}^{\frac{T - 25}{10}} \cdot \left[1 - \frac{1}{1 + e^{-k_d (T - T_m)}}\right]$$
   - $Q_{10} \approx 2.0$ (reaction rate doubles per $10^\circ\text{C}$ rise within physiological range $10\text{--}40^\circ\text{C}$).
   - $T_m = 58^\circ\text{C}$: Midpoint of irreversible protein conformational denaturation.
   - At $T > 65^\circ\text{C}$, catalytic activity drops to zero due to loss of secondary/tertiary folding.
3. **pH Bell-Curve Activity:**
   $$f(\text{pH}) = \frac{1}{1 + 10^{\text{pH} - \text{pK}_2} + 10^{\text{pK}_1 - \text{pH}}}$$
   - Optimal pH for salivary amylase: $\text{pH} = 6.8$. In strongly acidic stomach-like media ($\text{pH} < 4.0$), enzyme activity is abolished.

---

## 4. Blackman's Law of Limiting Factors (Experiment 6)

In 1905, F.F. Blackman formulated that when a physiological process is conditioned as to its rapidity by a number of separate factors, the rate of the process is limited by the pace of the slowest factor:
$$\text{Rate of Photosynthesis} = \min\left(R_{\text{light}}, R_{\text{CO}_2}, R_{\text{temp}}\right)$$
- **Light Intensity ($I$):** Rectangular hyperbola $R_{\text{light}} = \frac{R_{\max} \cdot I}{K_I + I}$.
- **Carbon Dioxide ($[\text{CO}_2]$):** Direct substrate saturation up to $\approx 0.05\%$.
- **Temperature ($T$):** Bell curve peaking at $30\text{--}35^\circ\text{C}$ for $C_3$ plants.
- **Educational Value:** Students experimentally discover that increasing light intensity beyond the saturation point yields no further increase in $\text{O}_2$ evolution unless $\text{CO}_2$ concentration is also augmented.

---

## 5. Mendelian Probability & Allelic Combinatorics (Experiment 9)

1. **Monohybrid Cross ($Aa \times Aa$):**
   - Gamete probabilities: $P(A) = 0.5$, $P(a) = 0.5$.
   - Offspring Genotypic Probabilities:
     $$P(AA) = 0.25,\quad P(Aa) = 0.50,\quad P(aa) = 0.25 \implies 1:2:1$$
   - Under complete dominance:
     $$P(\text{Dominant}) = 0.75,\quad P(\text{Recessive}) = 0.25 \implies 3:1$$

2. **Dihybrid Cross ($AaBb \times AaBb$):**
   - Product rule for two independently assorting unlinked gene loci:
     $$(3:1) \times (3:1) = 9:3:3:1$$
   - Recombinant phenotypes ($3/16$ and $3/16$) illustrate Mendel's Law of Independent Assortment.

---

## 6. Lindeman's 10% Trophic Energy Efficiency Law (Experiment 15)

In 1942, Raymond Lindeman demonstrated that roughly $10\%$ of net energy production transfers from one trophic level to the next:
$$E_{n+1} = E_n \cdot \eta_{\text{trophic}},\quad \eta_{\text{trophic}} \approx 0.10$$
- $90\%$ of consumed energy is dissipated as metabolic respiratory heat ($R$), excretion ($E$), and non-assimilated biomass.
- **Biomass & Energy Pyramids:** Explains why terrestrial food chains rarely exceed $4\text{--}5$ trophic levels.
- **Assumptions & Nuance:** The model clarifies that $10\%$ is an educational average; actual ecological efficiencies range from $5\%$ in terrestrial herbivores to $20\%$ in marine plankton systems.
