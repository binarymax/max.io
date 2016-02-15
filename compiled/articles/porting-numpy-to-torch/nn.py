import copy, numpy as np

np.random.seed(1)

def sigmoid(x):
	output = 1/(1+np.exp(-x))
	return output

def sigmoid_slope(x):
	output = x*(1-x)
	return output

X = np.array([
		[0,0,1],
		[0,1,1],
		[1,0,1],
		[1,1,1]
	])

y = np.array([[0],[0],[1],[1]])

#synapse_0 = 2*np.random.random((3,1)) - 1                        # <== random
synapse_0 = np.array([[-0.16595599],[ 0.44064899],[-0.99977125]]) # <== determ

for i in xrange(5000):
	layer_0 = X
	layer_1 = sigmoid( np.dot( layer_0, synapse_0 ) )
	layer_1_error = y.T - layer_1
	layer_1_slope = sigmoid_slope(layer_1)
	layer_1_delta = layer_1_error * layer_1_slope
	weight_adjust = np.dot( layer_0.T, layer_1_delta )
	synapse_0 = weight_adjust + synapse_0

print layer_1
