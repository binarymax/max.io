require 'torch'
function sigmoid_cdiv_fixed(A)
	B = torch.exp(-A) + 1
	C = torch.Tensor({{1},{1},{1},{1}})
	D = torch.cdiv(C,B)
	return D
end

for i=1,1000000 do
	tensor = torch.rand(4,1)*2-1
	sig_cdiv_fixed_0 = sigmoid_cdiv_fixed(tensor)
end