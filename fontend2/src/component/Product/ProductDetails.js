import React, { Fragment, useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import "./ProductDetails.css";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, getProductDetails, newReview } from "../../actions/productAction";
import ReviewCard from "./ReviewCard.js"
import Loader from "../layout/Loader/Loader.js";
import { useAlert } from "react-alert"
import MetaData from "../layout/MetaData";
import { addItemsToCart } from "../../actions/cartAction.js";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import { NEW_REVIEW_RESET } from "../../constants/productConstants.js";

//Cai nay co the coi la view hien thi

const ProductDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const alert = useAlert();

    const dispatch = useDispatch();

    const { user, isAuthenticated, loading: authLoading } = useSelector(state => state.user);

    const { product, loading, error } = useSelector(state => state.productDetails);

    // const { isAuthenticated } = useSelector(state => state.user);

    const { success, error: reviewError } = useSelector((state) => state.newReview);

    const [quantity, setQuantity] = useState(1);

    const [open, setOpen] = useState(false);

    const [rating, setRating] = useState(0);

    const [comment, setComment] = useState("");

    const [loginPromptOpen, setLoginPromptOpen] = useState(false);

    const increaseQuantity = () => {
        if (product.Stock <= quantity) return;
        const qty = quantity + 1;
        setQuantity(qty);
    };

    const decreaseQuantity = () => {
        if (1 >= quantity) return;
        const qty = quantity - 1;
        setQuantity(qty);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (isNaN(value) || value < 1) {
            setQuantity(1);
        } else if (value > product.Stock) {
            alert.error(`Only ${product.Stock} items available in stock`);
            setQuantity(product.Stock);
        } else {
            setQuantity(value);
        }
    };

    const addToCartHandler = () => {

        if (authLoading) {
            alert.info("Checking your login status. Please wait...");
            return;
        }
        if (!isAuthenticated) {
            setLoginPromptOpen(true);
            return;
        }
        if (!user) {
            alert.error("You need to log in to add this item to cart");
            return;
        }
        if (product.Stock < 1) {
            alert.error("This product is out of stock and cannot be added to cart.");
            return;
        }
        dispatch(addItemsToCart(id, quantity, user?._id.toString()));
        alert.success("Item Added To Cart");

    };

    const submitReviewToggle = () => {
        open ? setOpen(false) : setOpen(true);
    };

    const reviewSubmitHandler = () => {
        const myForm = new FormData();

        myForm.append("rating", rating);
        myForm.append("comment", comment);
        myForm.append("productId", id);
        dispatch(newReview(myForm));
        setOpen(false);
    };

    useEffect(() => {

        window.scrollTo(0, 0);
        if (error) {
            alert.error(error);
            dispatch(clearErrors());
        }

        if (reviewError) {
            alert.error(reviewError);
            dispatch(clearErrors());
        }

        if (success) {
            alert.success("Review Submitted Suuccessfully");
            dispatch({ type: NEW_REVIEW_RESET });
        }
        dispatch(getProductDetails(id))
    }, [dispatch, id, alert, error, reviewError, success]);

    const isProductLoaded = product && Object.keys(product).length > 0;
    const showLoader = loading || (!error && !isProductLoaded);
    const showNotFound = !showLoader && (error || !isProductLoaded);

    const options = {
        size: "large",
        value: product?.ratings || 0,
        readOnly: true,
        precision: 0.5,
    }
    return (
        <Fragment>
            {showLoader ? <Loader /> : (
                <Fragment>
                    {showNotFound ? (
                        <div className="productNotFound">
                            <h2>Product not found</h2>
                            <p>The product you are looking for does not exist or has been removed.</p>
                        </div>
                    ) : (
                        <>
                            <MetaData title={`${product.name} -- ECOMMERCE`} />
                            <div className="ProductDetails">
                                <div>
                                    <Carousel>
                                        {product && product.images &&
                                            product.images.map((item, i) => (
                                                <img
                                                    className="CarouselImage"
                                                    key={i}
                                                    // key={item.url}
                                                    src={item.url}
                                                    alt={`${i} Slide`}
                                                />))}
                                    </Carousel>
                                </div>

                                <div>
                                    <div className="detailsBlock-1">
                                        <h2>{product.name}</h2>
                                        <p>Product # {product?._id}</p>
                                    </div>
                                    <div className="detailsBlock-2">
                                        <Rating {...options} />
                                        <span className="detailsBlock-2-span">({product.numOfReviews} Reviews)</span>
                                    </div>
                                    <div className="detailsBlock-3">
                                        <h1>{`$ ${product.price}`}</h1>
                                        <div className="detailsBlock-3-1">
                                            <div className="detailsBlock-3-1-1">
                                                <button onClick={decreaseQuantity}>-</button>
                                                <input type="number" value={quantity} onChange={handleQuantityChange} min="1" max={product.Stock} />
                                                <button onClick={increaseQuantity} >+</button>
                                            </div>
                                            <button className={product.Stock < 1 ? "outOfStockButton" : ""} onClick={addToCartHandler} >Add to Cart</button>
                                        </div>

                                        <p>
                                            Status:
                                            <b className={product.Stock < 1 ? "redColor" : "greenColor"}>
                                                {product.Stock < 1 ? "OutOfStock" : `InStock (${product.Stock})`}
                                            </b>
                                        </p>
                                    </div>
                                    <div className="detailsBlock-4">
                                        Description: <p>{product.description}</p>
                                    </div>
                                    <button onClick={submitReviewToggle} className="submitReview">Submit Review</button>
                                </div>

                            </div>


                            <Dialog
                                open={loginPromptOpen}
                                onClose={() => setLoginPromptOpen(false)}
                            >
                                <DialogTitle>{"You need to log in to add this item to cart"}</DialogTitle>
                                <DialogActions>
                                    <Button onClick={() => setLoginPromptOpen(false)} color="secondary">
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setLoginPromptOpen(false);
                                            navigate(`/login?redirect=/product/${id}`);
                                        }}
                                        color="primary"
                                    >
                                        Go to Login
                                    </Button>
                                </DialogActions>
                            </Dialog>





                            <h3 className="reviewsHeading">REVIEWS</h3>


                            <Dialog
                                aria-labelledby="simple-dialog-title"
                                open={open}
                                onClose={submitReviewToggle}
                            >
                                <DialogTitle>Submit Review</DialogTitle>
                                <DialogContent className="submitDialog">
                                    <Rating
                                        onChange={(e) => setRating(e.target.value)}
                                        value={rating}
                                        size="large"
                                    />
                                    <textarea
                                        className="submitDialogTexArea"
                                        cols="30"
                                        rows="5"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    >

                                    </textarea>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={submitReviewToggle} color="secondary" >Cancel</Button>
                                    <Button onClick={reviewSubmitHandler} color="primary">Submit</Button>
                                </DialogActions>
                            </Dialog>




                            {product.reviews && product.reviews[0] ? (
                                <div className="reviews">
                                    {product.reviews &&
                                        product.reviews.map((review) => <ReviewCard key={review?._id} review={review} />)}
                                </div>
                            ) : (

                                <p className="noReviews">No Reviews Yet</p>
                            )}
                        </>
                    )}
                </Fragment>
            )
            }
        </Fragment >
    );

};

export default ProductDetails