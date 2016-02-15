import copy, numpy as np

#y = np.array([0,0,1,1])
y = np.array([[0],[0],[1],[1]])
X = np.array([
		[0,0,1],
		[0,1,1],
		[1,0,1],
		[1,1,1]
	])

A = X + y
print(A)

synapse_0 = np.array([
		[-0.16595599],
		[ 0.44064899],
		[-0.99977125]
	])
layer_0 = X
multi_0 = np.dot( layer_0, synapse_0 )
print multi_0


#compute sigmoid nonlinearity
def sigmoid(x):
	output = 1/(1+np.exp(-x))
	return output
sig_0 = sigmoid(multi_0)
print(sig_0)

def sigmoid_slope(x):
	output = x*(1-x)
	return output

K = np.array([
		[0,0,1],
		[0,1,1],
		[1,0,1],
		[1,1,1]
	])
t = K.T
print t