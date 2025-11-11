import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    IconButton,
    TextField,
    Typography,
    InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Search } from "@mui/icons-material";
import toast from "react-hot-toast";

type TableTypes = {
    data?: any[];
    heading?: string[];
};

const TableList: React.FC<TableTypes> = ({ data = [], heading = [] }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState<string>("");
    const [isData, setIsData] = useState<any[]>(data);
    console.log(isData, '---0')

    // ✅ Sync data from DB when prop changes
    useEffect(() => {
        setIsData(data);
    }, [data]);

    // ✅ Apply search filter dynamically
    const filteredData = isData.filter(
        (item) =>
            item?.customer.toLowerCase().includes(search?.toLowerCase()) ||
            item?.id.toLowerCase().includes(search?.toLowerCase()) ||
            item?.orderStatus.toLowerCase().includes(search?.toLowerCase())
    );

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const allIds = filteredData.map((item) => item.id);
            setSelected(allIds);
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelected((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id]
        );
    };

    const handleDelete = () => {
        const remaining = isData.filter((item) => !selected.includes(item.id));
        setIsData(remaining);
        toast.success("Order Deleted");
        setSelected([]);
    };

    const allSelected =
        selected.length === filteredData.length && filteredData.length > 0;

    return (
        <Box>
            <Paper elevation={3} sx={{ borderRadius: 4 }}>
                {/* ✅ Header with Search + Delete */}
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
                    <TextField
                        placeholder="Search..."
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            borderRadius: 50,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 50,
                            },
                        }}
                    />
                    <Box display="flex" gap={1}>
                        <IconButton
                            disabled={selected.length === 0}
                            onClick={handleDelete}
                            sx={{
                                border: `1px solid ${selected.length === 0 ? "gray" : "#d13232ff"
                                    }`,
                            }}
                        >
                            <DeleteIcon sx={{ color: selected.length === 0 ? "gray" : "red" }} />
                        </IconButton>
                    </Box>
                </Box>

                {/* ✅ Table */}
                <TableContainer sx={{ maxHeight: 700, overflowY: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox checked={allSelected} onChange={handleSelectAll} />
                                </TableCell>
                                {
                                    heading.map((e) => (
                                        <TableCell sx={{ fontWeight: 600 }}>{e}</TableCell>
                                    ))
                                }
                            </TableRow>

                        </TableHead>

                        <TableBody>
                            {filteredData.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selected.includes(row.id)}
                                            onChange={() => handleSelectOne(row.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.customer}</TableCell>
                                    <TableCell align="center">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color:
                                                    row.paymentStatus === "Paid"
                                                        ? "green"
                                                        : row.paymentStatus === "Pending"
                                                            ? "gray"
                                                            : "black",
                                                fontWeight: 500,
                                                bgcolor:
                                                    row.paymentStatus === "Paid"
                                                        ? "#c3e49e58"
                                                        : row.paymentStatus === "Pending"
                                                            ? "#cacaca6e"
                                                            : "transparent",
                                                p: 1,
                                                borderRadius: 2,
                                                width: 100,
                                            }}
                                        >
                                            {row.paymentStatus}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color:
                                                    row.orderStatus === "Ready"
                                                        ? "orange"
                                                        : row.orderStatus === "Shipped"
                                                            ? "navy"
                                                            : "blue",
                                                fontWeight: 500,
                                                bgcolor:
                                                    row.orderStatus === "Ready"
                                                        ? "#e5b06539"
                                                        : row.orderStatus === "Shipped"
                                                            ? "#6278a161"
                                                            : "#0c87fb61",
                                                p: 1,
                                                borderRadius: 2,
                                                width: 100,
                                            }}
                                        >
                                            {row.orderStatus}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{row.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default TableList;
