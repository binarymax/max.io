---
title: Porting a Numpy application to Torch
date: '2016-02-15'
author: binarymax
template: article.jade
tags: [code,lua,python,numpy,torch]
---

#Porting a Numpy application to Torch

This article outlines the process for poring IAmTrask's 9-line neural network[1] from Numpy (Python) to Torch (Lua).

When I started this project, I knew very little about neural networks, Python, and Lua.  After reading Karpathy's excellent Char-RNN article, and diving into the original code from Oxford ML class, I was intrigued and wanted to learn more.  Several articles later I found IAmTrask's brilliant articles and knew that it was finally time to dive in.  The Oxford code and other examples are all in Torch, and the Numpy code from IAmTrask has some key differences in how the libraries and languages work.  I've captured my process here, for those who are interested in any area of the above.  As I started from scratch I hope this can prove useful to others who get stuck or need guidance.  

Undertaking this seemingly small project has proven incredibly difficult and rewarding, considering the nature of not only the languages and libraries, but the complexity of neural networks themselves (not to mention needing a personal refresher course in Matrix mathematics).  Also, it should be obvious that I am not suddenly an expert in these domains.  While what I have written below may seem straightforward, it is only after much reading, trial and error, coffee, and help from the friendly folks in the Torch community that I have finally become somewhat confident these examples.  Therefore, if you see any errors or suggestions - please feel free to reach out!

---

##Matricies, Arrays, and Tensors

Let's start with the absolute basics: Matricies. 

In Numpy, a matrix is represented as an array.  In Torch, it is a tensor.  These two constructs form the basis for all of our operations, so lets dive into some basic examples:

###Numpy:
```python
y = np.array([0,0,1,1])
print y
```
Outputs:
```
[0 0 1 1]
```

###Torch:
```lua
y = torch.Tensor({0,0,1,1})
print(y)
```
Outputs:
```
 0
 0
 1
 1
[torch.DoubleTensor of size 4]
```

These are both one dimentional matricies of size 4, as taken from IAmTrasks example.  Before getting into his neural network though, we will need to know how to do the following in both libraries: dot product, matrix by matrix multiplication, addition, and subtraction.  Both libraries behave a little differently, and mapping the two gives us critical insight into their behavior.

##Matrix Addition

As a simple exercise, we want to create a 4x3 matrix 'X', and then add our 1 dimensional matrix 'y', and store the result in 'A'.  Note that for an mxn matrix, the m is the number of rows and n is the number of columns.  If you are used to representing (x,y) coordinates on an axis as columns and rows, prepare to force your brain to mentally remap!

###Numpy:
```python
y = np.array([0,0,1,1])
X = np.array([
		[0,0,1],
		[0,1,1],
		[1,0,1],
		[1,1,1]
	])
A = X + y
```
Outputs:
```
Traceback (most recent call last):
  File "python-examples.py", line 15, in <module>
    A = y + X
ValueError: operands could not be broadcast together with shapes (4,) (4,3)
```

###Torch:
```lua
y = torch.Tensor({0,0,1,1})
X = torch.Tensor({
	{0,0,1},
	{0,1,1},
	{1,0,1},
	{1,1,1}
})
A = X + y
```
Outputs:
```
/home/max/torch/install/bin/luajit: inconsistent tensor size at /home/max/torch
/pkg/torch/lib/TH/generic/THTensorMath.c:500
stack traceback:
        [C]: at 0x7ffb9bab25d0
        [C]: in function '__sub'
        torch-examples.lua:15: in main chunk
        [C]: in function 'dofile'
        .../max/torch/install/lib/luarocks/rocks/trepl/scm-1/bin/th:145: in main chunk
        [C]: at 0x00406670
```

What happened?  Well, we are missing a dimension.  In both cases, 'y' is one dimensional (4) and 'X' is two dimensional (4x1).  Also note that our Numpy error is a bit clearer in what went wrong.  It kindly gives us the code and exact problem, where Torch is a bit more vague by giving a generic exception and stack trace with a line number (but still has enough info to find the problem in our code).  Lets fix the issue in both, by making 'y' two dimensional as a 4x1 matrix and try again.  Note the change in declaration for the 'y' array/tensor in both examples:

###Numpy:
```python
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
```
Outputs:
```
[[0 0 1]
 [0 1 1]
 [2 1 2]
 [2 2 2]]
```

###Torch:
```lua
--y = torch.Tensor({0,0,1,1})
y = torch.Tensor({{0},{0},{1},{1}})
X = torch.Tensor({
	{0,0,1},
	{0,1,1},
	{1,0,1},
	{1,1,1}
})
A = X + y
```
Outputs:
```
/home/max/torch/install/bin/luajit: inconsistent tensor size at /home/max/torch
/pkg/torch/lib/TH/generic/THTensorMath.c:500
stack traceback:
        [C]: at 0x7f08896cc5d0
        [C]: in function '__sub'
        torch-examples.lua:15: in main chunk
        [C]: in function 'dofile'
        .../max/torch/install/lib/luarocks/rocks/trepl/scm-1/bin/th:145: in main chunk
        [C]: at 0x00406670
```

And now we see our first difference between the two libraries.  When we made our Array 4x1 in Numpy it worked fine, but Torch doesn't know how to add a 4x1 Tensor to a 4x3 Tensor.  To fix this, we need to make 'y' into a 4x3 Tensor so Torch can add them successfully.  This is easily done using the 'repeatTensor' Torch library method.  We will keep 'y' intact and make a new 4x3 Tensor 'B' and add that to 'X' instead:


###Torch:
```lua
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
```
Outputs:
```
 0  0  1
 0  1  1
 2  1  2
 2  2  2
[torch.DoubleTensor of size 4x3]
```

##Matrix multiplication

Lets try some multiplication.  Eventually we'll need to multiply matricies to as part of the network training.  We can use examples directly from IAmTrask, and convert that to Torch.  We'll create a 4x1 Tensor that will hold a synapse, and multiply it with our input layer 'X'.  Remember from Matrix arithmetic, when you multiply one matrix mxn with another matrix nxp, the result is an nxp matrix.


###Numpy:
```python
synapse_0 = np.array([
		[-0.16595599],
		[ 0.44064899],
		[-0.99977125]
	])
layer_0 = X
multi_0 = np.dot( layer_0, synapse_0 )
print multi_0
```
Outputs:
```
[[-0.99977125]
 [-0.55912226]
 [-1.16572724]
 [-0.72507825]]
```

###Torch:
```lua
synapse_0 = torch.Tensor({
		{-0.16595599},
		{ 0.44064899},
		{-0.99977125}
	})
layer_0 = X
multi_0 = layer_0 * synapse_0
print(multi_0)
```
Outputs:
```
-0.9998
-0.5591
-1.1657
-0.7251
[torch.DoubleTensor of size 4x1]
```

Note in the above example that the multiplication was a bit easier in Torch.  We needed to use the Numpy dot method to multiply the two, but in Torch the * operator has been overloaded.

##Sigmoid

Lets do a more complicated operation.  The reasons for calculating the sigmoid is well descibed in the cited articles, so we will need to perform the operation in our code.  Using 'multi_0' calculated above as our input into the function, this is expressed as follows:


###Numpy:
```python
def sigmoid(x):
	output = 1/(1+np.exp(-x))
	return output
sig_0 = sigmoid(multi_0)
print(sig_0)
```
Outputs:
```
[[ 0.2689864 ]
 [ 0.36375058]
 [ 0.23762817]
 [ 0.3262757 ]]
```

###Torch:
```lua
function sigmoid(A)
	B = torch.exp(-A) + 1
	B:apply(function(x) return 1/x end)
	return B
end
sig_0 = sigmoid(multi_0)
print(sig_0)
```
Outputs:
```
 0.2690
 0.3638
 0.2376
 0.3263
[torch.DoubleTensor of size 4x1]
```

We can see that in Numpy, the operation is straighforward, and was cleanly translated from the mathematical formula.  In Torch is is not so simple.  Even replacing ```torch.exp(-A) + 1``` with ```1 + torch.exp(-A)``` won't work, as type coercion in Lua can make sense of the latter.  Then we run into a scalar/matrix division problem due to the same reason, so we need to fall back to an element-by-element division using the Tensor's apply method.  That seems woefully inefficient though.  Wouldnt it be nice if we could do a matrix operation to get the inverse of each element?  There isn't a built in method, but we can construct a couple.

###Torch:
```lua
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
```

The first method 'sigmoid_cdiv_fixed' uses the element-wize Torch cdiv method for two tensor division, but you should notice that I used a hardcoded tensor declaration with a fixed size to calculate 'D'.  We'd rather that not be the case, so we can make it generic and create our 'sigmoid_cdiv' function, in which we construct 'C' by getting the size of 'A' and filling it with ones.

###Performance testing

All three functions give the same output, but which is best?  In the world of Machine Learning, we want the fastest solution.  We are also interested in the tradeoff of having the generic _cdiv function versus the _cdiv_fixed function with the fixed-size tensor.  

Let's construct a simple test and run through lots of calculations to see how performance works out.  For the test we will have three scripts.  Each will create a random 4x1 matrix and run one of the respective functions, and do it 100k times.

####Torch tensor:apply
```
max@SOLAR:~/blog/max.io/contents/articles/porting-numpy-to-torch$ time th torch_sigmoid_apply.lua 

real 0m2.318s
user 0m2.216s
sys  0m0.088s
```

####Torch tensor:cdiv fixed
```
max@SOLAR:~/blog/max.io/contents/articles/porting-numpy-to-torch$ time th torch_sigmoid_cdiv_fixed.lua 

real 0m2.666s
user 0m2.516s
sys  0m0.136s
```

####Torch tensor:cdiv
```
max@SOLAR:~/blog/max.io/contents/articles/porting-numpy-to-torch$ time th torch_sigmoid_cdiv.lua 

real 0m2.863s
user 0m2.740s
sys  0m0.112s
```

And there we have it, apply works the fastest because it doesnt need any matrix maths - it brute forces it with a loop.  It wasnt all for naught through, we learned an important lesson that will be very helpful in the future.  We also learned that we also lose a little less time than I expected when sizing the 'C' tensor at runtime.  So when possible it is best to use a fixed tensor for matrix operations, but you won't be penalized much when you do need a generic solution.  For reference, lets see how numpy performs with the no-nonsense calculation:

####Numpy sigmoid with coercion
```
max@SOLAR:~/blog/max.io/contents/articles/porting-numpy-to-torch$ time python python_sigmoid.py 

real 0m2.801s
user 0m2.788s
sys  0m0.016s
```

####1M iterations
Lets run all the tests one more time, increasing the iterations from 100K to 1M.
```
max@SOLAR:~/blog/max.io/contents/articles/porting-numpy-to-torch$ ./sigmoid_all.sh 

Torch apply
real 0m22.587s
user 0m21.792s
sys  0m0.780s

Torch cdiv_fixed
real 0m27.303s
user 0m26.316s
sys  0m0.972s

Torch cdiv
real 0m30.145s
user 0m29.116s
sys  0m1.012s

Numpy coercion
real 0m27.625s
user 0m27.608s
sys  0m0.012s
```

##Porting IamTrask's two layer NN

Now that we've attacked the basics, we have enough knowledge of Torch to do a full port.

---------------------------------

###Numpy:
```python
```
Outputs:
```
```

###Torch:
```lua
```
Outputs:
```
```
