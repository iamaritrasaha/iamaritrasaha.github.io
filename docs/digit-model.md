# A small network doing a real job

The live study recognizes 8 × 8 handwritten digits. Every displayed activation,
probability, loss and gradient comes from the same trained model. The moving
signals illustrate computation order; they are not biological neurons or a
measurement of hardware timing.

## Model and measured result

- Architecture: 64 inputs → 16 GELU units → 12 GELU units → 10 logits.
- Size: 1,336 learned weights + 38 biases = 1,374 parameters.
- Data: 1,797 images from scikit-learn's `load_digits` dataset; pixel intensities
  are divided by 16 to put them in [0, 1].
- Split: a local, stratified 80/20 split with seed 42; 1,437 training images and
  360 held-out test images. This is **not the official UCI training/test split**.
- The shipped, rounded parameters classify **348 of 360 held-out images
  correctly (96.7%)**. This is a small illustrative model trained for this
  portfolio, not a result claimed for Orion, SysAI or another project.
- Fixed training configuration: seed 17, 180 epochs, batch size 64, Adam with
  learning rate 0.005, β₁ = 0.9, β₂ = 0.999, ε = 10⁻⁸, and an L2 weight penalty
  λ = 0.0001. Biases are not regularized. He-normal weight initialization and
  zero biases. No dropout, data augmentation, test-driven tuning or checkpoint
  selection.

The first example of each digit in the deterministic test order is included,
regardless of prediction. An additional example is the first test
misclassification: dataset index 751, a **9 predicted as 4** with approximately
93.1% probability. High confidence does not guarantee a correct answer.

The browser runs inference and differentiation using frozen weights. It does
not train the model, submit images, call an API or need an ML runtime. All 1,336
connections participate in the calculation. The illustration displays only the
two largest-magnitude weights into each destination to remain legible; its
caption explains that selection.

## Mathematics

For x ∈ ℝ⁶⁴, the two hidden layers are

```text
z¹ = W¹x + b¹                  h¹ = GELU(z¹)
z² = W²h¹ + b²                 h² = GELU(z²)
s  = W³h² + b³

W¹ ∈ ℝ¹⁶ˣ⁶⁴, W² ∈ ℝ¹²ˣ¹⁶, W³ ∈ ℝ¹⁰ˣ¹²
GELU(z) ≈ ½z[1 + tanh(√(2/π)(z + 0.044715z³))]
```

The trainer and browser use the same tanh approximation. Softmax uses a
maximum subtraction for numerical stability. The selected-example loss is
cross-entropy, computed directly by log-sum-exp so it stays finite even if the
target probability underflows to zero:

```text
m = maxⱼ sⱼ
pᵢ = exp(sᵢ − m) / Σⱼ exp(sⱼ − m)
L = m − sᵧ + log Σⱼ exp(sⱼ − m)
```

Backpropagation differentiates that actual example, without applying a weight
update:

```text
δ³ = p − one_hot(y)
δ² = (W³ᵀδ³) ⊙ GELU′(z²)
δ¹ = (W²ᵀδ²) ⊙ GELU′(z¹)
∂L/∂Wˡ = δˡ(hˡ⁻¹)ᵀ           ∂L/∂bˡ = δˡ
∂L/∂x = W¹ᵀδ¹                 h⁰ = x
```

The offline trainer optimizes mean cross-entropy plus `(λ/2) Σₗ ||Wˡ||²`.
The live example intentionally reports only its own cross-entropy and
gradients, not the batch mean or regularization term.

## Reproduce

Training dependencies are development-only. The dataset is bundled with
scikit-learn; the script does not place a complete dataset in the repository.
The original export used Python 3.12, NumPy 2.5.3 and scikit-learn 1.9.1:

```sh
python3 -m venv /tmp/portfolio-digit-env
/tmp/portfolio-digit-env/bin/pip install numpy==2.5.3 scikit-learn==1.9.1
OPENBLAS_NUM_THREADS=1 /tmp/portfolio-digit-env/bin/python scripts/train_digit_model.py
node --test scripts/check_network.mjs
```

The script writes `assets/digit-model.js`, including eight-decimal parameters,
eleven held-out images and measured metadata. Two independent scalar-reference
fixtures go into `scripts/fixtures/digit-reference.json`; the browser never
loads these test-only values. It evaluates the rounded parameters, not a higher-precision model
that differs from the browser. Floating-point libraries and versions may affect
the least significant digits when rerunning elsewhere.

`assets/neural-network.js` evaluates the model without browser APIs. Tests cover
forward activations, probabilities, loss and backward values against the Python
scalar implementation, all **1,438** weight/bias/input derivatives against
central finite differences, GELU derivatives, softmax underflow, immutable
parameters and invalid inputs.

## Data provenance and attribution

The digits come from **E. Alpaydin and C. Kaynak**, _Optical Recognition of
Handwritten Digits_, UCI Machine Learning Repository,
[DOI 10.24432/C50P49](https://doi.org/10.24432/C50P49).
The [UCI dataset page](https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits)
publishes the dataset under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
The subset is distributed through
[scikit-learn's `load_digits`](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html).

Changes made for this study: pixel values normalized by 16; a deterministic
local train/test partition; eleven test examples included in the browser;
a small network trained on the local training partition. The exported reference
values and learned parameters are generated by the included training script.
