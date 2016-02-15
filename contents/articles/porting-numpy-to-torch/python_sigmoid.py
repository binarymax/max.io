import copy, numpy as np
def sigmoid(x):
	output = 1/(1+np.exp(-x))
	return output

for i in xrange(1000000):
	matrix = 2*np.random.random((4,1))-1
	sig_0 = sigmoid(matrix)
