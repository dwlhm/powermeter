from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from configuration.config import load_config
from dependencies import oauth2_scheme

from .db import (
    get_data_with_datetime,
    get_data_with_datetime_fromonly,
    get_data_with_datetime_fromonly_limit,
    get_data_with_datetime_limit,
    get_data_with_limit,
    get_consumption,
)

router = APIRouter(prefix="/data", tags=["Data"], dependencies=[Depends(oauth2_scheme)])


@router.get("/{id}/arsip")
async def get_data_arsip(
    id: str,
    interval: Literal["hourly", "daily", "weekly", "monthly", "yearly"],
    dfrom: str,
    dto: str,
    limit: int = None,
):
    result = get_data_with_datetime(
        interval=interval, id=id, date_from=dfrom, date_to=dto, config=load_config()
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result.get("error"))

    item = result.get("data")
    print("item: ", item)
    data = {
        "data": {
            "phase_voltage_a": [],
            "phase_voltage_b": [],
            "phase_voltage_c": [],
            "wire_voltage_ab": [],
            "wire_voltage_bc": [],
            "wire_voltage_ca": [],
            "phase_current_a": [],
            "phase_current_b": [],
            "phase_current_c": [],
            "active_power_a": [],
            "active_power_b": [],
            "active_power_c": [],
            "reactive_power_a": [],
            "reactive_power_b": [],
            "reactive_power_c": [],
            "apparent_power_a": [],
            "apparent_power_b": [],
            "apparent_power_c": [],
            "power_factor_a": [],
            "power_factor_b": [],
            "power_factor_c": [],
            "frequency": [],
            "active_power": [],
            "reactive_power": [],
            "positive_active_power": [],
            "negative_active_power": [],
            "positive_reactive_power": [],
            "negative_reactive_power": [],
            "current_active_power_demand": [],
            "maximum_active_power_demand": [],
            "current_reactive_power_demand": [],
            "maximum_reactive_power_demand": [],
            "a_phase_voltage_total_harmonic_content": [],
            "b_phase_voltage_total_harmonic_content": [],
            "c_phase_voltage_total_harmonic_content": [],
            "a_phase_current_total_harmonic_content": [],
            "b_phase_current_total_harmonic_content": [],
            "c_phase_current_total_harmonic_content": [],
            "o_phase_current": [],
            "phase_voltage_maximum": [],
            "Wires_voltage_maximum": [],
            "current_maximum": [],
            "voltage_imbalance": [],
            "current_imbalance": [],
            "a_b_phase_voltage_angle": [],
            "b_C_phase_voltage_angle": [],
            "c_a_phase_voltage_angle": [],
            "first_quadrant_reactive_energy": [],
            "second_quadrant_reactive_energy": [],
            "third_quadrant_reactive_energy": [],
            "fourth_quadrant_reactive_power": [],
        },
        "timestamp": [],
        "length": len(item),
    }
    for d in reversed(item):
        data["data"]["phase_voltage_a"].append(d[0])
        (data["data"]["phase_voltage_b"].append(d[1]),)
        (data["data"]["phase_voltage_c"].append(d[2]),)
        (data["data"]["wire_voltage_ab"].append(d[3]),)
        (data["data"]["wire_voltage_bc"].append(d[4]),)
        (data["data"]["wire_voltage_ca"].append(d[5]),)
        (data["data"]["phase_current_a"].append(d[6]),)
        (data["data"]["phase_current_b"].append(d[7]),)
        (data["data"]["phase_current_c"].append(d[8]),)
        (data["data"]["active_power_a"].append(d[9]),)
        (data["data"]["active_power_b"].append(d[10]),)
        (data["data"]["active_power_c"].append(d[11]),)
        (data["data"]["reactive_power_a"].append(d[12]),)
        (data["data"]["reactive_power_b"].append(d[13]),)
        (data["data"]["reactive_power_c"].append(d[14]),)
        (data["data"]["apparent_power_a"].append(d[15]),)
        (data["data"]["apparent_power_b"].append(d[16]),)
        (data["data"]["apparent_power_c"].append(d[17]),)
        (data["data"]["power_factor_a"].append(d[18]),)
        (data["data"]["power_factor_b"].append(d[19]),)
        (data["data"]["power_factor_c"].append(d[20]),)
        (data["data"]["frequency"].append(d[21]),)
        (data["data"]["active_power"].append(d[22]),)
        (data["data"]["reactive_power"].append(d[23]),)
        (data["data"]["positive_active_power"].append(d[24]),)
        (data["data"]["negative_active_power"].append(d[25]),)
        (data["data"]["positive_reactive_power"].append(d[26]),)
        (data["data"]["negative_reactive_power"].append(d[27]),)
        (data["data"]["current_active_power_demand"].append(d[28]),)
        (data["data"]["maximum_active_power_demand"].append(d[29]),)
        (data["data"]["current_reactive_power_demand"].append(d[30]),)
        (data["data"]["maximum_reactive_power_demand"].append(d[31]),)
        (data["data"]["a_phase_voltage_total_harmonic_content"].append(d[32]),)
        (data["data"]["b_phase_voltage_total_harmonic_content"].append(d[33]),)
        (data["data"]["c_phase_voltage_total_harmonic_content"].append(d[34]),)
        (data["data"]["a_phase_current_total_harmonic_content"].append(d[35]),)
        (data["data"]["b_phase_current_total_harmonic_content"].append(d[36]),)
        (data["data"]["c_phase_current_total_harmonic_content"].append(d[37]),)
        (data["data"]["o_phase_current"].append(d[38]),)
        (data["data"]["phase_voltage_maximum"].append(d[39]),)
        (data["data"]["Wires_voltage_maximum"].append(d[40]),)
        (data["data"]["current_maximum"].append(d[41]),)
        (data["data"]["voltage_imbalance"].append(d[42]),)
        (data["data"]["current_imbalance"].append(d[43]),)
        (data["data"]["a_b_phase_voltage_angle"].append(d[44]),)
        (data["data"]["b_C_phase_voltage_angle"].append(d[45]),)
        (data["data"]["c_a_phase_voltage_angle"].append(d[46]),)
        (data["data"]["first_quadrant_reactive_energy"].append(d[47]),)
        (data["data"]["second_quadrant_reactive_energy"].append(d[48]),)
        (data["data"]["third_quadrant_reactive_energy"].append(d[49]),)
        (data["data"]["fourth_quadrant_reactive_power"].append(d[50]),)
        data["timestamp"].append(d[-1])
    return {"status": "success", "results": data}


@router.get("/{id}/consumption")
async def get_data_konsumsi_listrik(id: str, year: int = None):
    result = get_consumption(
        device_id=id, year=datetime.now().year, config=load_config()
    )

    if result.get("error"):
        return HTTPException(status_code=400, detail=result.get("error"))
    data = result.get("data")
    res = []

    for item in data:
        res.append({"energy": item[1], "timestamp": item[0]})
    return {"status": "success", "results": res}


@router.get("/{id}")
async def get_data_by_interval_and_datetime(
    id: str,
    interval: Literal["realtime", "hourly", "daily", "weekly", "monthly", "yearly"],
    dfrom: str = None,
    dto: str = None,
    limit: int = None,
):
    result = {}
    if dfrom is None and dto is None:
        if limit is None:
            limit = 1
        result = get_data_with_limit(
            interval=interval, id=id, limit=limit, config=load_config()
        )
    elif dfrom is not None and dto is None:
        if limit is None:
            result = get_data_with_datetime_fromonly(
                interval=interval, id=id, date_from=dfrom, config=load_config()
            )
            print("D", result)
        else:
            result = get_data_with_datetime_fromonly_limit(
                interval=interval,
                id=id,
                date_from=dfrom,
                limit=limit,
                config=load_config(),
            )
            print("D", result)
    else:
        if limit is None:
            result = get_data_with_datetime(
                interval=interval,
                id=id,
                date_from=dfrom,
                date_to=dto,
                config=load_config(),
            )
        else:
            result = get_data_with_datetime_limit(
                interval=interval,
                id=id,
                date_from=dfrom,
                date_to=dto,
                limit=limit,
                config=load_config(),
            )

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result.get("error"))

    item = result.get("data")
    data = {
        "data": {
            "phase_voltage_a": [],
            "phase_voltage_b": [],
            "phase_voltage_c": [],
            "wire_voltage_ab": [],
            "wire_voltage_bc": [],
            "wire_voltage_ca": [],
            "phase_current_a": [],
            "phase_current_b": [],
            "phase_current_c": [],
            "active_power_a": [],
            "active_power_b": [],
            "active_power_c": [],
            "reactive_power_a": [],
            "reactive_power_b": [],
            "reactive_power_c": [],
            "apparent_power_a": [],
            "apparent_power_b": [],
            "apparent_power_c": [],
            "power_factor_a": [],
            "power_factor_b": [],
            "power_factor_c": [],
            "frequency": [],
            "active_power": [],
            "reactive_power": [],
            "positive_active_power": [],
            "negative_active_power": [],
            "positive_reactive_power": [],
            "negative_reactive_power": [],
            "current_active_power_demand": [],
            "maximum_active_power_demand": [],
            "current_reactive_power_demand": [],
            "maximum_reactive_power_demand": [],
            "a_phase_voltage_total_harmonic_content": [],
            "b_phase_voltage_total_harmonic_content": [],
            "c_phase_voltage_total_harmonic_content": [],
            "a_phase_current_total_harmonic_content": [],
            "b_phase_current_total_harmonic_content": [],
            "c_phase_current_total_harmonic_content": [],
            "o_phase_current": [],
            "phase_voltage_maximum": [],
            "Wires_voltage_maximum": [],
            "current_maximum": [],
            "voltage_imbalance": [],
            "current_imbalance": [],
            "a_b_phase_voltage_angle": [],
            "b_C_phase_voltage_angle": [],
            "c_a_phase_voltage_angle": [],
            "first_quadrant_reactive_energy": [],
            "second_quadrant_reactive_energy": [],
            "third_quadrant_reactive_energy": [],
            "fourth_quadrant_reactive_power": [],
        },
        "timestamp": [],
        "length": len(item),
    }
    for d in reversed(item):
        data["data"]["phase_voltage_a"].append(d[0])
        (data["data"]["phase_voltage_b"].append(d[1]),)
        (data["data"]["phase_voltage_c"].append(d[2]),)
        (data["data"]["wire_voltage_ab"].append(d[3]),)
        (data["data"]["wire_voltage_bc"].append(d[4]),)
        (data["data"]["wire_voltage_ca"].append(d[5]),)
        (data["data"]["phase_current_a"].append(d[6]),)
        (data["data"]["phase_current_b"].append(d[7]),)
        (data["data"]["phase_current_c"].append(d[8]),)
        (data["data"]["active_power_a"].append(d[9]),)
        (data["data"]["active_power_b"].append(d[10]),)
        (data["data"]["active_power_c"].append(d[11]),)
        (data["data"]["reactive_power_a"].append(d[12]),)
        (data["data"]["reactive_power_b"].append(d[13]),)
        (data["data"]["reactive_power_c"].append(d[14]),)
        (data["data"]["apparent_power_a"].append(d[15]),)
        (data["data"]["apparent_power_b"].append(d[16]),)
        (data["data"]["apparent_power_c"].append(d[17]),)
        (data["data"]["power_factor_a"].append(d[18]),)
        (data["data"]["power_factor_b"].append(d[19]),)
        (data["data"]["power_factor_c"].append(d[20]),)
        (data["data"]["frequency"].append(d[21]),)
        (data["data"]["active_power"].append(d[22]),)
        (data["data"]["reactive_power"].append(d[23]),)
        (data["data"]["positive_active_power"].append(d[24]),)
        (data["data"]["negative_active_power"].append(d[25]),)
        (data["data"]["positive_reactive_power"].append(d[26]),)
        (data["data"]["negative_reactive_power"].append(d[27]),)
        (data["data"]["current_active_power_demand"].append(d[28]),)
        (data["data"]["maximum_active_power_demand"].append(d[29]),)
        (data["data"]["current_reactive_power_demand"].append(d[30]),)
        (data["data"]["maximum_reactive_power_demand"].append(d[31]),)
        (data["data"]["a_phase_voltage_total_harmonic_content"].append(d[32]),)
        (data["data"]["b_phase_voltage_total_harmonic_content"].append(d[33]),)
        (data["data"]["c_phase_voltage_total_harmonic_content"].append(d[34]),)
        (data["data"]["a_phase_current_total_harmonic_content"].append(d[35]),)
        (data["data"]["b_phase_current_total_harmonic_content"].append(d[36]),)
        (data["data"]["c_phase_current_total_harmonic_content"].append(d[37]),)
        (data["data"]["o_phase_current"].append(d[38]),)
        (data["data"]["phase_voltage_maximum"].append(d[39]),)
        (data["data"]["Wires_voltage_maximum"].append(d[40]),)
        (data["data"]["current_maximum"].append(d[41]),)
        (data["data"]["voltage_imbalance"].append(d[42]),)
        (data["data"]["current_imbalance"].append(d[43]),)
        (data["data"]["a_b_phase_voltage_angle"].append(d[44]),)
        (data["data"]["b_C_phase_voltage_angle"].append(d[45]),)
        (data["data"]["c_a_phase_voltage_angle"].append(d[46]),)
        (data["data"]["first_quadrant_reactive_energy"].append(d[47]),)
        (data["data"]["second_quadrant_reactive_energy"].append(d[48]),)
        (data["data"]["third_quadrant_reactive_energy"].append(d[49]),)
        (data["data"]["fourth_quadrant_reactive_power"].append(d[50]),)
        data["timestamp"].append(d[-1])
    return {"status": "success", "results": data}
