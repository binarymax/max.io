require 'torch'

torch.manualSeed(1)

function sigmoid(A)
	B = torch.exp(-A) + 1
	B:apply(function(x) return 1/x end)
	return B
end

function sigmoid_slope(A)
	B = torch.cmul(A,((-A)+1))
	return B
end

X = torch.Tensor({
	{0,0,1},
	{0,1,1},
	{1,0,1},
	{1,1,1}
})

y = torch.Tensor({{0},{0},{1},{1}}):repeatTensor(1,4)

--synapse_0 = torch.rand(3,1)*2-1                                     -- <== random
synapse_0 = torch.Tensor({{-0.16595599},{ 0.44064899},{-0.99977125}}) -- <== determ
synapse_0 = torch.repeatTensor(synapse_0,1,4)

for i=1,5000 do
	layer_0 = X
	layer_1 = sigmoid(torch.mm(layer_0,synapse_0))
	layer_1_error = y:t() - layer_1
	layer_1_slope = sigmoid_slope(layer_1)
	layer_1_delta = torch.cmul(layer_1_error,layer_1_slope)
	layer_0_trans = layer_0:t()
	weight_adjust = torch.mm(layer_0_trans,layer_1_delta)
	synapse_0:add(weight_adjust)
end

print(layer_1)