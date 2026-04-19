import React, { Fragment, useEffect, useState } from "react";
import "./ProductList.css";
import { useSelector, useDispatch } from "react-redux";
import { getAdminProduct, clearErrors, deleteProduct } from "../../actions/productAction";
import { Link } from "react-router-dom";
import { useAlert } from "react-alert";
import { Button } from "@material-ui/core";
import MetaData from "../layout/MetaData";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import WarningIcon from "@material-ui/icons/Warning";
import Slidebar from "./Slidebar";
import { DataGrid } from "@material-ui/data-grid"
import { useNavigate } from "react-router-dom";
import { DELETE_PRODUCT_RESET } from "../../constants/productConstants";
import Loader from "../layout/Loader/Loader";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";

const ProductList = () => {

    const dispatch = useDispatch();
    const alert = useAlert();
    const navigate = useNavigate();
    const { error, loading, products } = useSelector((state) => state.products);

    const { error: deleteError, isDeleted } = useSelector((state) => state.product);

    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const deleteProductHandler = (id) => {
        setDeleteId(id);
        setOpen(true);
    };

    const confirmDelete = () => {
        dispatch(deleteProduct(deleteId));
        setOpen(false);
    };

    const cancelDelete = () => {
        setOpen(false);
        setDeleteId(null);
    };

    useEffect(() => {
        if (error) {
            alert.error(error);
            dispatch(clearErrors());
        }

        if (deleteError) {
            alert.error(deleteError);
            dispatch(clearErrors());
        }
        if (isDeleted) {
            alert.success("Product Deleted Successfully");
            navigate("/admin/dashboard");
            dispatch({ type: DELETE_PRODUCT_RESET });
        }

        dispatch(getAdminProduct());

    }, [error, alert, dispatch, deleteError, navigate, isDeleted]);

    const columns = [
        { field: "id", headerName: "Product ID", minWidth: 200, flex: 0.5 },
        {
            field: "name",
            headerName: "Name",
            minWidth: 350,
            flex: 1,
        },
        {
            field: "Stock",
            headerName: "Stock",
            type: "number",
            minWidth: 150,
            flex: 0.3,
        },
        {
            field: "price",
            headerName: "Price",
            type: "number",
            flex: 0.5,
        },
        {
            field: "actions",
            flex: 0.3,
            headerName: "Actions",
            minWidth: 150,
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <Fragment>
                        <Link to={`/admin/product/${params.row.id}`}>
                            <EditIcon />
                        </Link>
                        <Button onClick={() => deleteProductHandler(params.row.id)}>
                            <DeleteIcon />
                        </Button>

                    </Fragment>
                );
            },
        },
    ];



    const rows = [];

    products && products.forEach((item) => {
        rows.push({
            id: item._id,
            Stock: item.Stock,
            price: item.price,
            name: item.name,
        });
    });

    return (
        <Fragment>
            <MetaData title={`ALL PRODUCTS - ADMIN`} />

            <div className="dashboard">
                <Slidebar />
                <div className="productListContainer">
                    <h1 id="productListHeading" >ALL PRODUCTS</h1>

                    {products ? (<DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={12}
                        disableSelectionOnClick
                        className="productListTable"
                        autoHeight
                        key={products.length}
                    />
                    ) : (<Loader />)}
                </div>
            </div>

            <Dialog
                open={open}
                onClose={cancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" style={{ display: 'flex', alignItems: 'center', color: '#f44336' }}>
                    <WarningIcon style={{ marginRight: 8 }} />
                    Delete Product
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this product? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="secondary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Fragment>
    )
}

export default ProductList