package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.EffortEstimateRequest;
import com.polycoder.relmgmt.dto.EffortEstimateResponse;
import com.polycoder.relmgmt.dto.ScopeItemRequest;
import com.polycoder.relmgmt.dto.ScopeItemResponse;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.EffortEstimateRepository;
import com.polycoder.relmgmt.repository.ProjectRepository;
import com.polycoder.relmgmt.repository.ScopeItemRepository;
import com.polycoder.relmgmt.service.impl.ScopeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScopeServiceTest {

    @Mock
    private ScopeItemRepository scopeItemRepository;

    @Mock
    private EffortEstimateRepository effortEstimateRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ScopeServiceImpl scopeService;

    private Project project;
    private ScopeItem scopeItem;

    @BeforeEach
    void setUp() {
        Release release = new Release();
        release.setId(11L);
        release.setName("R");
        release.setIdentifier("2025-011");

        project = new Project();
        project.setId(2L);
        project.setName("P");
        project.setType(ProjectTypeEnum.DAY_1);
        project.setRelease(release);

        scopeItem = new ScopeItem();
        scopeItem.setId(5L);
        scopeItem.setName("Login");
        scopeItem.setProject(project);

        // Common lenient stubs used by validation helpers
        lenient().when(projectRepository.existsById(2L)).thenReturn(true);
    }

    @Test
    void testFindByProjectIdPaged() {
        Pageable pageable = PageRequest.of(0, 10);
        when(scopeItemRepository.findByProjectId(2L, pageable))
                .thenReturn(new PageImpl<>(Arrays.asList(scopeItem), pageable, 1));
        Page<ScopeItemResponse> page = scopeService.findByProjectId(2L, pageable);
        assertEquals(1, page.getTotalElements());
    }

    @Test
    void testCreateScopeItem() {
        ScopeItemRequest req = new ScopeItemRequest();
        req.setName("Login");
        req.setDescription("auth");
        when(projectRepository.findById(2L)).thenReturn(Optional.of(project));
        when(scopeItemRepository.existsByProjectIdAndName(2L, "Login")).thenReturn(false);
        when(scopeItemRepository.save(any(ScopeItem.class))).thenReturn(scopeItem);
        ScopeItemResponse resp = scopeService.create(2L, req);
        assertEquals("Login", resp.getName());
    }

    @Test
    void testCreateScopeItemProjectNotFound() {
        ScopeItemRequest req = new ScopeItemRequest();
        req.setName("Login");
        when(projectRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> scopeService.create(2L, req));
    }

    @Test
    void testUpdateScopeItem() {
        ScopeItemRequest req = new ScopeItemRequest();
        req.setName("Dashboard");
        when(scopeItemRepository.findById(5L)).thenReturn(Optional.of(scopeItem));
        when(scopeItemRepository.existsByProjectIdAndName(2L, "Dashboard")).thenReturn(false);
        when(scopeItemRepository.save(any(ScopeItem.class))).thenReturn(scopeItem);
        ScopeItemResponse resp = scopeService.update(5L, req);
        assertEquals("Dashboard", resp.getName());
    }

    @Test
    void testDeleteScopeItemWithEstimatesConflict() {
        EffortEstimate e = new EffortEstimate();
        e.setPhase(PhaseTypeEnum.BUILD);
        e.setSkillFunction(SkillFunctionEnum.BUILD);
        e.setEffortDays(5.0);
        scopeItem.addEffortEstimate(e);
        when(scopeItemRepository.findById(5L)).thenReturn(Optional.of(scopeItem));
        assertThrows(ValidationException.class, () -> scopeService.delete(5L));
        verify(scopeItemRepository, never()).delete(any());
    }

    @Test
    void testAddEffortEstimates() {
        EffortEstimateRequest er = new EffortEstimateRequest();
        er.setSkillFunction(SkillFunctionEnum.BUILD);
        er.setPhase(PhaseTypeEnum.BUILD);
        er.setEffortDays(10.0);
        when(scopeItemRepository.findById(5L)).thenReturn(Optional.of(scopeItem));
        when(effortEstimateRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
        List<EffortEstimateResponse> list = scopeService.addEffortEstimates(5L, Arrays.asList(er));
        assertEquals(1, list.size());
        assertEquals(10.0, list.get(0).getEffortDays());
    }

    @Test
    void testSumEffortDays() {
        when(effortEstimateRepository.sumEffortDaysByScopeItemIdAndSkillFunction(5L, SkillFunctionEnum.BUILD)).thenReturn(20.0);
        Double sum = scopeService.sumEffortDaysByScopeItemIdAndSkillFunction(5L, "BUILD");
        assertEquals(20.0, sum);
    }
}


