"""
Grader for Custom LeakyReLU PyTorch Layer.
Contains 2 public tests and 2 hidden tests.
"""
import pytest
import torch
from submission import CustomLeakyReLU


@pytest.mark.public
def test_output_shape_and_dtype():
    """Checks that output retains the input tensor shape, device, and dtype."""
    x = torch.randn(3, 16, dtype=torch.float32)
    layer = CustomLeakyReLU(negative_slope=0.01)
    out = layer(x)
    assert out.shape == x.shape, f"Expected shape {x.shape}, got {out.shape}"
    assert out.dtype == x.dtype, f"Expected dtype {x.dtype}, got {out.dtype}"


@pytest.mark.public
def test_positive_and_negative_forward():
    """Verifies that positive elements remain unchanged and negative elements are multiplied by slope."""
    x = torch.tensor([-2.0, -1.0, 0.0, 1.5, 3.0])
    slope = 0.05
    layer = CustomLeakyReLU(negative_slope=slope)
    out = layer(x)
    expected = torch.tensor([-0.10, -0.05, 0.0, 1.5, 3.0])
    torch.testing.assert_close(out, expected, atol=1e-5, rtol=1e-5)


@pytest.mark.hidden
def test_gradient_flow_backward():
    """Checks that backward gradients match theoretical gradients: 1.0 for positive, slope for negative."""
    x = torch.tensor([-4.0, -2.0, 1.0, 3.0], requires_grad=True)
    slope = 0.1
    layer = CustomLeakyReLU(negative_slope=slope)
    out = layer(x)
    loss = out.sum()
    loss.backward()
    
    expected_grad = torch.tensor([0.1, 0.1, 1.0, 1.0])
    torch.testing.assert_close(x.grad, expected_grad, atol=1e-5, rtol=1e-5)


@pytest.mark.hidden
def test_torch_native_consistency():
    """Validates behavior against PyTorch official torch.nn.functional.leaky_relu."""
    x = torch.randn(10, 20, 5, requires_grad=True)
    slope = 0.02
    layer = CustomLeakyReLU(negative_slope=slope)
    out = layer(x)
    expected = torch.nn.functional.leaky_relu(x, negative_slope=slope)
    torch.testing.assert_close(out, expected, atol=1e-6, rtol=1e-6)
