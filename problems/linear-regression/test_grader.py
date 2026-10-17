"""
Grader for Closed-Form Linear Regression.
Contains 1 public test (for student verification) and 3 hidden tests.
"""
import pytest
import numpy as np
from submission import LinearRegressionModel


@pytest.mark.public
def test_1d_simple_line():
    """Validates fitting and prediction on a simple synthetic 1D line: y = 2x + 1."""
    X = np.array([[1.0], [2.0], [3.0], [4.0], [5.0]])
    y = np.array([3.0, 5.0, 7.0, 9.0, 11.0])
    
    model = LinearRegressionModel()
    model.fit(X, y)
    
    preds = model.predict(X)
    np.testing.assert_allclose(preds, y, atol=1e-5, err_msg="Failed on exact linear relation")
    np.testing.assert_allclose(model.weights, np.array([2.0]), atol=1e-4)
    np.testing.assert_allclose(model.bias, 1.0, atol=1e-4)


@pytest.mark.hidden
def test_multivariate_accuracy():
    """Checks multivariate feature regression against analytical coefficients."""
    rng = np.random.default_rng(123)
    N, D = 100, 5
    true_w = np.array([1.5, -2.0, 0.5, 3.2, -1.1])
    true_b = 4.2
    
    X = rng.normal(size=(N, D))
    y = X @ true_w + true_b
    
    model = LinearRegressionModel().fit(X, y)
    np.testing.assert_allclose(model.weights, true_w, atol=1e-5)
    np.testing.assert_allclose(model.bias, true_b, atol=1e-5)


@pytest.mark.hidden
def test_noisy_generalization():
    """Verifies that model achieves low Mean Squared Error (MSE < 0.05) on noisy test data."""
    rng = np.random.default_rng(42)
    N_train, N_test, D = 200, 50, 3
    true_w = np.array([2.5, -1.5, 0.8])
    true_b = -0.5
    
    X_train = rng.uniform(-5, 5, size=(N_train, D))
    noise = rng.normal(0, 0.1, size=N_train)
    y_train = X_train @ true_w + true_b + noise
    
    X_test = rng.uniform(-5, 5, size=(N_test, D))
    y_test = X_test @ true_w + true_b
    
    model = LinearRegressionModel().fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mse = np.mean((y_pred - y_test) ** 2)
    assert mse < 0.05, f"MSE {mse} exceeded threshold 0.05"


@pytest.mark.hidden
def test_collinear_features_stability():
    """Tests resilience to singular / collinear feature matrices where standard inversion fails."""
    X = np.array([
        [1.0, 2.0],
        [2.0, 4.0],
        [3.0, 6.0],
        [4.0, 8.0]
    ])
    y = np.array([3.0, 6.0, 9.0, 12.0])
    
    model = LinearRegressionModel()
    model.fit(X, y)
    preds = model.predict(X)
    np.testing.assert_allclose(preds, y, atol=1e-4, err_msg="Failed to solve collinear system")
