"""
Grader for Numerically Stable Softmax.
Contains 2 public tests (for student debugging) and 3 hidden tests (for final grading).
"""
import pytest
import numpy as np
from submission import stable_softmax


@pytest.mark.public
def test_output_shape():
    """Verifies that the output tensor maintains the same shape as input."""
    x = np.random.randn(4, 8)
    out = stable_softmax(x)
    assert out.shape == (4, 8), f"Expected shape (4, 8), got {out.shape}"


@pytest.mark.public
def test_sums_to_one():
    """Checks that probabilities sum to 1.0 along the feature axis."""
    x = np.array([[1.0, 2.0, 3.0], [0.5, -1.0, 2.2]])
    out = stable_softmax(x, axis=-1)
    sums = np.sum(out, axis=-1)
    np.testing.assert_allclose(sums, np.ones(2), atol=1e-6, err_msg="Rows must sum to 1.0")


@pytest.mark.hidden
def test_extreme_large_logits_stability():
    """Evaluates numerical stability under massive positive logits that cause standard exp() overflow."""
    x = np.array([[1000.0, 1001.0, 1002.0], [50000.0, 50000.0, 50001.0]])
    out = stable_softmax(x, axis=-1)
    assert not np.isnan(out).any(), "Found NaN in output with large logits"
    assert not np.isinf(out).any(), "Found Inf in output with large logits"
    np.testing.assert_allclose(np.sum(out, axis=-1), np.ones(2), atol=1e-6)


@pytest.mark.hidden
def test_arbitrary_axis_handling():
    """Tests softmax computation across non-default axes (e.g., axis=0 and 3D tensors)."""
    x = np.random.randn(3, 5, 4)
    out = stable_softmax(x, axis=1)
    assert out.shape == (3, 5, 4)
    sums = np.sum(out, axis=1)
    np.testing.assert_allclose(sums, np.ones((3, 4)), atol=1e-6)


@pytest.mark.hidden
def test_mathematical_correctness_reference():
    """Compares student output against scipy.special.softmax reference."""
    from scipy.special import softmax as scipy_softmax
    rng = np.random.default_rng(42)
    x = rng.uniform(-100, 100, size=(10, 12))
    expected = scipy_softmax(x, axis=-1)
    actual = stable_softmax(x, axis=-1)
    np.testing.assert_allclose(actual, expected, atol=1e-6, rtol=1e-5)
