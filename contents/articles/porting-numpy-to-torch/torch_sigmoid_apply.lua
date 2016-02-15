require 'torch'
function sigmoid_apply(A)
	B = torch.exp(-A) + 1
	B:apply(function(x) return 1/x end)
	return B
end

for i=1,1000000 do
	tensor = torch.rand(4,1)*2-1
	sig_0  = sigmoid_apply(tensor)
end
