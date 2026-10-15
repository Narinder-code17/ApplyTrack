package com.applytrack.service;

import com.applytrack.entity.Company;
import com.applytrack.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company createCompany(Company company) {

        if (companyRepository.existsByName(company.getName())) {
            throw new RuntimeException("Company already exists");
        }

        return companyRepository.save(company);
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }
}