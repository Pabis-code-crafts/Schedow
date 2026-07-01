

package com.schedow.schedule_service.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schedow.schedule_service.dto.UserResponse;

@Service
public class WorkerProvider {

    public List<UserResponse> getWorkers() {

        List<UserResponse> workers = new ArrayList<>();

        workers.add(create(1L,"John",20));
        workers.add(create(2L,"Sarah",20));
        workers.add(create(3L,"Alex",16));
        workers.add(create(4L,"Emma",12));
        workers.add(create(5L,"Tom",24));

        return workers;
    }

    private UserResponse create(
            Long id,
            String name,
            Integer contractedHours
    ){

        UserResponse worker = new UserResponse();

        worker.setId(id);
        worker.setName(name);
        worker.setContractedHours(contractedHours);
        worker.setActive(true);

        return worker;
    }

}