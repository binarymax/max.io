require 'torch'

--y = torch.Tensor({0,0,1,1})
y = torch.Tensor({{0},{0},{1},{1}})
X = torch.Tensor({
	{0,0,1},
	{0,1,1},
	{1,0,1},
	{1,1,1}
})
B = torch.repeatTensor(y,1,3)
A = X + B
print(A)

synapse_0 = torch.Tensor({
		{-0.16595599},
		{ 0.44064899},
		{-0.99977125}
	})

layer_0 = X
multi_0 = layer_0 * synapse_0
print(multi_0)

function sigmoid(A)
	B = torch.exp(-A) + 1
	B:apply(function(x) return 1/x end)
	return B
end

function sigmoid_cdiv_fixed(A)
	B = torch.exp(-A) + 1
	C = torch.Tensor({{1},{1},{1},{1}})
	D = torch.cdiv(C,B)
	return D
end

function sigmoid_cdiv(A)
	B = torch.exp(-A) + 1
	C = torch.Tensor(A:size(1),1):fill(1)
	D = torch.cdiv(C,B)
	return D
end

sig_0 = sigmoid(multi_0)
print(sig_0)
sig_cdiv_fixed_0 = sigmoid_cdiv_fixed(multi_0)
print(sig_cdiv_fixed_0)
sig_cdiv_0 = sigmoid_cdiv(multi_0)
print(sig_cdiv_0)