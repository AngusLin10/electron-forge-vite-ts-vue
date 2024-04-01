<!-- <template>
  <h1>💖 Hello World!</h1>
  <p>Welcome to your Electron application.</p>
  <div class="App">
    <el-button type="primary"> el-button </el-button>
  </div>
</template>

<script setup>
console.log('👋 This message is being logged by "App.vue", included via Vite');
</script> -->
<template>
  <el-form
    ref="ruleFormRef"
    style="max-width: 600px"
    :model="ruleForm"
    :rules="rules"
    label-width="auto"
    class="demo-ruleForm"
    size="large"
    status-icon
  >
    <el-form-item label="伺服器 IP" prop="serverIP">
      <el-input
        v-model="ruleForm.serverIP"
      />
    </el-form-item>
    <el-form-item label="註冊碼" prop="registrationCode">
      <el-input
        v-model="ruleForm.registrationCode"
      />
    </el-form-item>
    <el-form-item label="機器代碼" prop="machineCode">
      <el-input
        v-model="ruleForm.machineCode"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(ruleFormRef)">
        Register
      </el-button>
      <el-button @click="resetForm(ruleFormRef)">
        Reset
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface RuleForm {
  serverIP: string
  registrationCode: string
  machineCode: string
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  serverIP: '',
  registrationCode: '',
  machineCode: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
  serverIP: [{ required: true, message: '請輸入伺服器IP', trigger: 'blur' }],
  registrationCode: [{ required: true, message: '請輸入註冊碼', trigger: 'blur' }],
  machineCode: [{ required: true, message: '請輸入機器代碼', trigger: 'blur' }],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>


